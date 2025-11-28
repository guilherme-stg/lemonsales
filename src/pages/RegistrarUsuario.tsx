import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

export default function RegistrarUsuario() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState<'VENDEDOR' | 'GESTOR'>('VENDEDOR');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && profile && profile.papel !== 'MASTER' && profile.papel !== 'GESTOR') {
      navigate('/rankings');
    }
  }, [user, profile, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !email) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: Math.random().toString(36).slice(-8),
      options: {
        data: {
          nome,
          papel,
          criado_por: user!.id
        }
      }
    });

    if (error) {
      toast.error('Erro ao registrar usuário: ' + error.message);
    } else {
      toast.success('Usuário registrado com sucesso!');
      setNome('');
      setEmail('');
      setPapel('VENDEDOR');
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow">
          <UserPlus className="w-16 h-16 text-primary" />
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
              Registrar Usuário
            </h1>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <Card className="gaming-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-primary" />
                    Novo Usuário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Nome do usuário"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="gaming-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="gaming-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="papel">Papel</Label>
                      <Select value={papel} onValueChange={(value: 'VENDEDOR' | 'GESTOR') => setPapel(value)}>
                        <SelectTrigger className="gaming-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                          <SelectItem value="GESTOR">Gestor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:opacity-90"
                      disabled={loading}
                    >
                      {loading ? 'Registrando...' : 'Registrar Usuário'}
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
