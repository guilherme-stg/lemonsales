import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, Gift, Trophy } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface MetaEquipe {
  id: string;
  periodo: string;
  valor_meta_time: number;
  data_inicio: string;
  data_fim: string;
}

interface Bonificacao {
  id: string;
  percentual_meta: number;
  titulo: string;
  descricao: string;
}

interface MetaComBonificacoes extends MetaEquipe {
  bonificacoes: Bonificacao[];
}

export default function Metas() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [metas, setMetas] = useState<MetaComBonificacoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendaTotal, setVendaTotal] = useState(0);
  const [numVendedores, setNumVendedores] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && profile) {
      loadMetas();
      loadNumVendedores();
    }
  }, [user, profile]);

  const loadNumVendedores = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('papel', 'VENDEDOR')
      .eq('aprovado', true);
    
    setNumVendedores(count || 1);
  };

  const loadMetas = async () => {
    setLoading(true);
    
    // Get active metas
    const { data: metasData, error: metasError } = await supabase
      .from('metas_equipe')
      .select('*')
      .eq('ativa', true)
      .order('created_at', { ascending: false });

    if (metasError) {
      console.error('Error loading metas:', metasError);
      setLoading(false);
      return;
    }

    if (!metasData || metasData.length === 0) {
      setMetas([]);
      setLoading(false);
      return;
    }

    // Get bonificacoes for each meta
    const metasComBonificacoes: MetaComBonificacoes[] = await Promise.all(
      metasData.map(async (meta) => {
        const { data: bonificacoesData } = await supabase
          .from('bonificacoes_meta')
          .select('*')
          .eq('meta_id', meta.id)
          .order('percentual_meta', { ascending: true });

        return {
          ...meta,
          bonificacoes: bonificacoesData || []
        };
      })
    );

    setMetas(metasComBonificacoes);

    // Calculate sales total for current period
    if (metasComBonificacoes.length > 0) {
      const meta = metasComBonificacoes[0];
      const { data: vendasData } = await supabase
        .from('vendas')
        .select('valor')
        .eq('status', 'APROVADA')
        .gte('data_venda', meta.data_inicio)
        .lte('data_venda', meta.data_fim);

      const total = vendasData?.reduce((sum, v) => sum + Number(v.valor), 0) || 0;
      setVendaTotal(total);
    }
    
    setLoading(false);
  };

  // Setup realtime subscription for updates
  useEffect(() => {
    if (!user) return;

    const metasChannel = supabase
      .channel('metas-updates-page')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'metas_equipe'
        },
        () => {
          loadMetas();
        }
      )
      .subscribe();

    const vendasChannel = supabase
      .channel('vendas-updates-metas')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendas'
        },
        () => {
          loadMetas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(metasChannel);
      supabase.removeChannel(vendasChannel);
    };
  }, [user]);

  const getBonusIcon = (percentual: number) => {
    switch (percentual) {
      case 33:
        return <Gift className="w-5 h-5 text-secondary" />;
      case 66:
        return <Target className="w-5 h-5 text-accent" />;
      case 100:
        return <Trophy className="w-5 h-5 text-primary" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getBonusColor = (percentual: number) => {
    switch (percentual) {
      case 33:
        return 'gaming-border-secondary bg-secondary/5';
      case 66:
        return 'gaming-border-accent bg-accent/5';
      case 100:
        return 'gaming-border bg-primary/5';
      default:
        return 'gaming-border';
    }
  };

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

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {metas.length === 0 ? (
                <Card className="gaming-border">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma meta ativa no momento</p>
                    <p className="text-sm mt-2">Aguarde seu gestor configurar as metas</p>
                  </CardContent>
                </Card>
              ) : (
                metas.map((meta) => {
                  const progresso = (vendaTotal / meta.valor_meta_time) * 100;
                  const faltam = meta.valor_meta_time - vendaTotal;
                  const metaIndividual = meta.valor_meta_time / numVendedores;

                  return (
                    <div key={meta.id} className="space-y-6">
                      {/* Card da Meta Principal */}
                      <Card className="gaming-border">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="w-5 h-5 text-primary" />
                              Meta {meta.periodo}
                            </div>
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                              {meta.periodo}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progresso do Time</span>
                              <span className="font-bold">{progresso.toFixed(1)}%</span>
                            </div>
                            <Progress value={progresso} className="h-4 gaming-border" />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-1">Atual</p>
                              <p className="text-lg font-bold text-accent">
                                R$ {vendaTotal.toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-1">Meta Time</p>
                              <p className="text-lg font-bold text-primary">
                                R$ {meta.valor_meta_time.toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-1">Meta Individual</p>
                              <p className="text-lg font-bold text-secondary">
                                R$ {metaIndividual.toLocaleString('pt-BR')}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-muted-foreground mb-1">Faltam</p>
                              <p className="text-lg font-bold text-foreground">
                                R$ {Math.max(0, faltam).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          {progresso >= 100 && (
                            <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent">
                              <TrendingUp className="w-5 h-5 text-accent" />
                              <span className="text-sm font-medium text-accent">
                                Meta atingida! Parabéns ao time! 🎉
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Timeline de Bonificações */}
                      {meta.bonificacoes.length > 0 && (
                        <Card className="gaming-border">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Gift className="w-5 h-5 text-secondary" />
                              Bonificações
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {meta.bonificacoes.map((bonus, index) => {
                              const atingido = progresso >= bonus.percentual_meta;
                              
                              return (
                                <div
                                  key={bonus.id}
                                  className={`relative p-4 rounded-lg transition-all ${getBonusColor(bonus.percentual_meta)} ${
                                    atingido ? 'ring-2 ring-accent' : 'opacity-60'
                                  }`}
                                >
                                  {/* Linha conectora */}
                                  {index < meta.bonificacoes.length - 1 && (
                                    <div className="absolute left-[22px] top-full h-4 w-0.5 bg-border" />
                                  )}
                                  
                                  <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-full ${atingido ? 'bg-accent' : 'bg-muted'} flex-shrink-0`}>
                                      {atingido ? (
                                        <Trophy className="w-5 h-5 text-accent-foreground" />
                                      ) : (
                                        getBonusIcon(bonus.percentual_meta)
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant={atingido ? "default" : "outline"} className={atingido ? 'bg-accent text-accent-foreground' : ''}>
                                          {bonus.percentual_meta}%
                                        </Badge>
                                        <h3 className="font-bold text-lg">{bonus.titulo}</h3>
                                        {atingido && (
                                          <Badge variant="secondary" className="ml-auto bg-accent/20 text-accent">
                                            Desbloqueado!
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {bonus.descricao}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
