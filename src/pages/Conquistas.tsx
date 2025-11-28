import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock, Check } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  raridade: string;
  desbloqueada: boolean;
  data_desbloqueio?: string;
}

export default function Conquistas() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadConquistas();
    }
  }, [user]);

  const loadConquistas = async () => {
    setLoading(true);
    
    const { data: allConquistas, error: conquistasError } = await supabase
      .from('conquistas')
      .select('*');

    const { data: userConquistas, error: userError } = await supabase
      .from('conquistas_usuarios')
      .select('conquista_id, data_desbloqueio')
      .eq('usuario_id', user!.id);

    if (!conquistasError && !userError) {
      const conquistasMap = new Map(userConquistas?.map(uc => [uc.conquista_id, uc.data_desbloqueio]));
      
      const conquistasComStatus: Conquista[] = (allConquistas || []).map(c => ({
        id: c.id,
        nome: c.nome,
        descricao: c.descricao,
        raridade: c.raridade,
        desbloqueada: conquistasMap.has(c.id),
        data_desbloqueio: conquistasMap.get(c.id)
      }));

      setConquistas(conquistasComStatus);
    }
    
    setLoading(false);
  };

  const getRaridadeColor = (raridade: string) => {
    switch (raridade) {
      case 'COMUM':
        return 'bg-[hsl(240_5%_50%)]';
      case 'RARO':
        return 'bg-[hsl(210_100%_55%)]';
      case 'EPICO':
        return 'bg-[hsl(280_90%_60%)]';
      case 'LENDARIO':
        return 'bg-[hsl(40_100%_55%)]';
      default:
        return 'bg-muted';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Award className="w-16 h-16 text-primary" />
        </div>
      </div>
    );
  }

  const conquistasDesbloqueadas = conquistas.filter(c => c.desbloqueada).sort((a, b) => 
    new Date(b.data_desbloqueio!).getTime() - new Date(a.data_desbloqueio!).getTime()
  );
  const conquistasBloqueadas = conquistas.filter(c => !c.desbloqueada);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b gaming-border flex items-center px-6">
            <SidebarTrigger />
            <h1 className="ml-4 text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Minhas Conquistas
            </h1>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              <Card className="gaming-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-accent" />
                    Conquistas Desbloqueadas ({conquistasDesbloqueadas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {conquistasDesbloqueadas.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma conquista desbloqueada ainda
                    </p>
                  ) : (
                    conquistasDesbloqueadas.map((conquista) => (
                      <Card key={conquista.id} className="gaming-border-accent hover-lift">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-gradient-accent">
                              <Award className="w-8 h-8 text-accent-foreground" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">{conquista.nome}</h3>
                                <Badge className={getRaridadeColor(conquista.raridade)}>
                                  {conquista.raridade}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {conquista.descricao}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Desbloqueado em {new Date(conquista.data_desbloqueio!).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card className="gaming-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    Conquistas Bloqueadas ({conquistasBloqueadas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {conquistasBloqueadas.map((conquista) => (
                    <Card key={conquista.id} className="gaming-border-secondary opacity-60">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-muted">
                            <Lock className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{conquista.nome}</h3>
                              <Badge className={getRaridadeColor(conquista.raridade)}>
                                {conquista.raridade}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {conquista.descricao}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
