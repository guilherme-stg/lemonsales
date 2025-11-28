import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, Clock, Users } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface Solicitacao {
  id: string;
  usuario_id: string;
  status: string;
  created_at: string;
  profiles: {
    nome: string;
    email?: string;
  };
}

export default function Solicitacoes() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !profile)) {
      navigate('/auth');
    } else if (profile && profile.papel !== 'MASTER') {
      navigate('/dashboard');
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (profile?.papel === 'MASTER') {
      loadSolicitacoes();
    }
  }, [profile]);

  const loadSolicitacoes = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('solicitacoes_cadastro')
      .select(`
        id,
        usuario_id,
        status,
        created_at,
        profiles!solicitacoes_cadastro_usuario_id_fkey (nome)
      `)
      .eq('status', 'PENDENTE')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar solicitações');
      console.error(error);
    } else {
      setSolicitacoes(data || []);
    }
    
    setLoading(false);
  };

  const handleAprovar = async (solicitacaoId: string, usuarioId: string) => {
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ aprovado: true })
      .eq('id', usuarioId);

    if (updateProfileError) {
      toast.error('Erro ao aprovar usuário');
      return;
    }

    const { error: updateSolicitacaoError } = await supabase
      .from('solicitacoes_cadastro')
      .update({ 
        status: 'APROVADO',
        avaliado_por: user?.id 
      })
      .eq('id', solicitacaoId);

    if (updateSolicitacaoError) {
      toast.error('Erro ao atualizar solicitação');
      return;
    }

    toast.success('Usuário aprovado com sucesso!');
    loadSolicitacoes();
  };

  const handleRecusar = async (solicitacaoId: string, usuarioId: string) => {
    const { error: updateSolicitacaoError } = await supabase
      .from('solicitacoes_cadastro')
      .update({ 
        status: 'RECUSADO',
        avaliado_por: user?.id 
      })
      .eq('id', solicitacaoId);

    if (updateSolicitacaoError) {
      toast.error('Erro ao recusar solicitação');
      return;
    }

    // Delete the user account
    // Note: This requires admin privileges or service role
    toast.success('Solicitação recusada');
    loadSolicitacoes();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Users className="w-16 h-16 text-primary" />
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
              Solicitações de Cadastro
            </h1>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="gaming-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    Aguardando Aprovação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {solicitacoes.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma solicitação pendente</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {solicitacoes.map((solicitacao) => (
                        <Card key={solicitacao.id} className="gaming-border-secondary">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="font-bold text-lg">
                                  {solicitacao.profiles.nome}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Solicitado em {new Date(solicitacao.created_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <Badge variant="outline" className="gaming-border-accent">
                                  Pendente
                                </Badge>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleAprovar(solicitacao.id, solicitacao.usuario_id)}
                                  className="bg-gradient-accent hover:opacity-90"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Aprovar
                                </Button>
                                <Button
                                  onClick={() => handleRecusar(solicitacao.id, solicitacao.usuario_id)}
                                  variant="destructive"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Recusar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
