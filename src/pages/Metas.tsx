import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface Meta {
  id: string;
  titulo: string;
  valorAtual: number;
  valorMeta: number;
  periodo: string;
}

export default function Metas() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [metas, setMetas] = useState<Meta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && profile) {
      loadMetas();
    }
  }, [user, profile]);

  const loadMetas = async () => {
    setLoading(true);
    
    // Calculate monthly and weekly sales
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Get monthly sales
    const { data: monthData } = await supabase
      .from('vendas')
      .select('valor')
      .eq('usuario_id', user!.id)
      .eq('status', 'APROVADA')
      .gte('data_venda', startOfMonth.toISOString());

    // Get weekly sales
    const { data: weekData } = await supabase
      .from('vendas')
      .select('valor')
      .eq('usuario_id', user!.id)
      .eq('status', 'APROVADA')
      .gte('data_venda', startOfWeek.toISOString());

    const monthTotal = monthData?.reduce((sum, v) => sum + Number(v.valor), 0) || 0;
    const weekTotal = weekData?.reduce((sum, v) => sum + Number(v.valor), 0) || 0;

    setMetas([
      {
        id: '1',
        titulo: 'Meta Mensal',
        valorAtual: monthTotal,
        valorMeta: 50000,
        periodo: 'Mensal'
      },
      {
        id: '2',
        titulo: 'Meta Semanal',
        valorAtual: weekTotal,
        valorMeta: 12000,
        periodo: 'Semanal'
      }
    ]);
    
    setLoading(false);
  };

  // Setup realtime subscription for sales updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('metas-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendas',
          filter: `usuario_id=eq.${user.id}`
        },
        () => {
          // Reload metas when new sale is added
          loadMetas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Target className="w-16 h-16 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b gaming-border flex items-center px-6">
            <SidebarTrigger />
            <h1 className="ml-4 text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Acompanhar Metas
            </h1>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {metas.map((meta) => {
                const progresso = (meta.valorAtual / meta.valorMeta) * 100;
                const faltam = meta.valorMeta - meta.valorAtual;

                return (
                  <Card key={meta.id} className="gaming-border">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          {meta.titulo}
                        </div>
                        <span className="text-sm text-muted-foreground font-normal">
                          {meta.periodo}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-bold">{progresso.toFixed(1)}%</span>
                        </div>
                        <Progress value={progresso} className="h-4 gaming-border" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Atual</p>
                          <p className="text-xl font-bold text-accent">
                            R$ {meta.valorAtual.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Meta</p>
                          <p className="text-xl font-bold text-primary">
                            R$ {meta.valorMeta.toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Faltam</p>
                          <p className="text-xl font-bold text-secondary">
                            R$ {faltam.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      {progresso >= 100 && (
                        <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent">
                          <TrendingUp className="w-5 h-5 text-accent" />
                          <span className="text-sm font-medium text-accent">
                            Meta atingida! Parabéns! 🎉
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {metas.length === 0 && (
                <Card className="gaming-border">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma meta definida no momento</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
