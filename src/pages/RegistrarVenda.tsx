import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, DollarSign } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

export default function RegistrarVenda() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [valorProducao, setValorProducao] = useState('');
  const [valorSetup, setValorSetup] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!valorProducao || !valorSetup) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);

    const producao = parseFloat(valorProducao.replace(',', '.'));
    const setup = parseFloat(valorSetup.replace(',', '.'));
    const total = producao + setup;

    const pontos = Math.floor(total / 10);

    const { error } = await supabase
      .from('vendas')
      .insert({
        usuario_id: user!.id,
        valor: total,
        tipo_venda: 'NOVA',
        cliente: 'Cliente',
        pontos_base: pontos,
        pontos_totais: pontos,
        status: 'APROVADA'
      });

    if (error) {
      toast.error('Erro ao registrar venda');
      console.error(error);
    } else {
      toast.success(`Venda registrada! +${pontos} pontos 🎉`);
      setValorProducao('');
      setValorSetup('');
      
      // Redirect to rankings after 1.5 seconds
      setTimeout(() => navigate('/rankings'), 1500);
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Plus className="w-16 h-16 text-primary" />
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
              Registrar Venda
            </h1>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <Card className="gaming-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-accent" />
                    Nova Venda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="valorProducao">Valor de Produção (R$)</Label>
                      <Input
                        id="valorProducao"
                        type="text"
                        placeholder="0,00"
                        value={valorProducao}
                        onChange={(e) => setValorProducao(e.target.value)}
                        className="gaming-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorSetup">Valor de Setup (R$)</Label>
                      <Input
                        id="valorSetup"
                        type="text"
                        placeholder="0,00"
                        value={valorSetup}
                        onChange={(e) => setValorSetup(e.target.value)}
                        className="gaming-border"
                      />
                    </div>

                    {(valorProducao || valorSetup) && (
                      <Card className="gaming-border-accent">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Valor Total:</span>
                            <span className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                              R$ {(
                                parseFloat(valorProducao.replace(',', '.') || '0') + 
                                parseFloat(valorSetup.replace(',', '.') || '0')
                              ).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-muted-foreground">Pontos Estimados:</span>
                            <span className="text-xl font-bold text-primary">
                              {Math.floor(
                                (parseFloat(valorProducao.replace(',', '.') || '0') + 
                                parseFloat(valorSetup.replace(',', '.') || '0')) / 10
                              )} pts
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-primary hover:opacity-90"
                      disabled={loading}
                    >
                      {loading ? 'Registrando...' : 'Registrar Venda'}
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
