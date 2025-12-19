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
import { Plus, DollarSign, Users } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface Vendedor {
  id: string;
  nome: string;
}

export default function RegistrarVenda() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [valorProducao, setValorProducao] = useState('');
  const [valorSetup, setValorSetup] = useState('');
  const [loading, setLoading] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [selectedVendedor, setSelectedVendedor] = useState<string>('');
  const [loadingVendedores, setLoadingVendedores] = useState(false);

  const isMaster = profile?.papel === 'MASTER';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Carregar vendedores se for MASTER
  useEffect(() => {
    if (isMaster && user) {
      loadVendedores();
    }
  }, [isMaster, user]);

  const loadVendedores = async () => {
    setLoadingVendedores(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome')
        .eq('aprovado', true)
        .order('nome');

      if (error) throw error;
      setVendedores(data || []);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      toast.error('Erro ao carregar lista de vendedores');
    } finally {
      setLoadingVendedores(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!valorProducao && !valorSetup) {
      toast.error('Preencha pelo menos um valor (Produção ou Setup)');
      return;
    }

    // Se for MASTER, precisa selecionar um vendedor
    if (isMaster && !selectedVendedor) {
      toast.error('Selecione o vendedor que realizou a venda');
      return;
    }

    setLoading(true);

    const producao = parseFloat(valorProducao.replace(',', '.'));
    const setup = parseFloat(valorSetup.replace(',', '.'));
    const total = producao + setup;

    const pontos = Math.floor(total / 10);

    // MASTER pode registrar para outro vendedor, demais usuários registram para si mesmos
    const usuarioIdVenda = isMaster ? selectedVendedor : user!.id;

    const { error } = await supabase
      .from('vendas')
      .insert({
        usuario_id: usuarioIdVenda,
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
      const vendedorNome = isMaster 
        ? vendedores.find(v => v.id === selectedVendedor)?.nome || 'Vendedor'
        : 'Você';
      toast.success(`Venda registrada para ${vendedorNome}! +${pontos} pontos 🎉`);
      setValorProducao('');
      setValorSetup('');
      setSelectedVendedor('');
      
      // Redirect to rankings after 1.5 seconds
      setTimeout(() => navigate('/rankings'), 1500);
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Plus className="w-16 h-16 text-primary animate-pulse" />
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
                    {/* Seleção de vendedor - apenas para MASTER */}
                    {isMaster && (
                      <div className="space-y-2">
                        <Label htmlFor="vendedor" className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Vendedor
                        </Label>
                        <Select 
                          value={selectedVendedor} 
                          onValueChange={setSelectedVendedor}
                          disabled={loadingVendedores}
                        >
                          <SelectTrigger className="gaming-border">
                            <SelectValue placeholder={loadingVendedores ? "Carregando..." : "Selecione o vendedor"} />
                          </SelectTrigger>
                          <SelectContent className="bg-background border gaming-border z-50">
                            {vendedores.map((vendedor) => (
                              <SelectItem key={vendedor.id} value={vendedor.id}>
                                {vendedor.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Como administrador, você pode registrar vendas para qualquer vendedor
                        </p>
                      </div>
                    )}

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
                      disabled={loading || (isMaster && !selectedVendedor)}
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