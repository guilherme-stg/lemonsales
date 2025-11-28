import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Key } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

export default function AlterarSenha() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('c563a0f3-214c-453b-83fc-5cbefa038e3c');
  const [newPassword, setNewPassword] = useState('matheus_plagiador');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && profile && profile.papel !== 'MASTER') {
      navigate('/rankings');
    }
  }, [user, profile, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !newPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        toast.error('Sessão não encontrada');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: {
          userId,
          newPassword,
        },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        }
      });

      if (error) {
        console.error('Error calling function:', error);
        toast.error('Erro ao alterar senha: ' + error.message);
      } else if (data.error) {
        toast.error('Erro ao alterar senha: ' + data.error);
      } else {
        toast.success('Senha alterada com sucesso!');
        setUserId('');
        setNewPassword('');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Erro inesperado ao alterar senha');
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Key className="w-16 h-16 text-primary animate-pulse" />
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
              Alterar Senha de Usuário
            </h1>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <Card className="gaming-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary" />
                    Redefinir Senha (Apenas MASTER)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="userId">ID do Usuário</Label>
                      <Input
                        id="userId"
                        type="text"
                        placeholder="UUID do usuário"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="gaming-border font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="gaming-border"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:opacity-90"
                      disabled={loading}
                    >
                      {loading ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
