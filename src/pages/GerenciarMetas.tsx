import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings, Users, Target, Gift } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

export default function GerenciarMetas() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [periodo, setPeriodo] = useState<'SEMANAL' | 'MENSAL' | 'TRIMESTRAL'>('MENSAL');
  const [valorMetaTime, setValorMetaTime] = useState('');
  const [numVendedores, setNumVendedores] = useState(0);
  const [loading, setLoading] = useState(false);

  // Bonificações
  const [bonus1Titulo, setBonus1Titulo] = useState('');
  const [bonus1Desc, setBonus1Desc] = useState('');
  const [bonus2Titulo, setBonus2Titulo] = useState('');
  const [bonus2Desc, setBonus2Desc] = useState('');
  const [bonus3Titulo, setBonus3Titulo] = useState('');
  const [bonus3Desc, setBonus3Desc] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && profile && profile.papel !== 'MASTER' && profile.papel !== 'GESTOR') {
      navigate('/rankings');
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    loadNumVendedores();
  }, []);

  const loadNumVendedores = async () => {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('papel', 'VENDEDOR')
      .eq('aprovado', true);
    
    setNumVendedores(count || 0);
  };

  const calcularDatas = (periodo: string) => {
    const now = new Date();
    let dataInicio = new Date();
    let dataFim = new Date();

    if (periodo === 'SEMANAL') {
      dataInicio = new Date(now);
      dataInicio.setDate(now.getDate() - now.getDay());
      dataFim = new Date(dataInicio);
      dataFim.setDate(dataInicio.getDate() + 6);
    } else if (periodo === 'MENSAL') {
      dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
      dataFim = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (periodo === 'TRIMESTRAL') {
      const quarter = Math.floor(now.getMonth() / 3);
      dataInicio = new Date(now.getFullYear(), quarter * 3, 1);
      dataFim = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
    }

    return { dataInicio, dataFim };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!valorMetaTime || !bonus1Titulo || !bonus2Titulo || !bonus3Titulo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    // Desativar metas anteriores do mesmo período
    await supabase
      .from('metas_equipe')
      .update({ ativa: false })
      .eq('periodo', periodo)
      .eq('ativa', true);

    const { dataInicio, dataFim } = calcularDatas(periodo);

    // Criar nova meta
    const { data: metaData, error: metaError } = await supabase
      .from('metas_equipe')
      .insert({
        periodo,
        valor_meta_time: parseFloat(valorMetaTime),
        data_inicio: dataInicio.toISOString(),
        data_fim: dataFim.toISOString(),
        criado_por: user!.id,
        ativa: true
      })
      .select()
      .single();

    if (metaError) {
      toast.error('Erro ao criar meta');
      console.error(metaError);
      setLoading(false);
      return;
    }

    // Criar bonificações
    const bonificacoes = [
      { percentual_meta: 33, titulo: bonus1Titulo, descricao: bonus1Desc },
      { percentual_meta: 66, titulo: bonus2Titulo, descricao: bonus2Desc },
      { percentual_meta: 100, titulo: bonus3Titulo, descricao: bonus3Desc }
    ];

    const { error: bonusError } = await supabase
      .from('bonificacoes_meta')
      .insert(
        bonificacoes.map(b => ({
          meta_id: metaData.id,
          percentual_meta: b.percentual_meta,
          titulo: b.titulo,
          descricao: b.descricao
        }))
      );

    if (bonusError) {
      toast.error('Erro ao criar bonificações');
      console.error(bonusError);
    } else {
      toast.success('Meta configurada com sucesso!');
      // Limpar formulário
      setValorMetaTime('');
      setBonus1Titulo('');
      setBonus1Desc('');
      setBonus2Titulo('');
      setBonus2Desc('');
      setBonus3Titulo('');
      setBonus3Desc('');
    }

    setLoading(false);
  };

  const metaIndividual = valorMetaTime && numVendedores > 0 
    ? parseFloat(valorMetaTime) / numVendedores 
    : 0;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Settings className="w-16 h-16 text-primary" />
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
              Gerenciar Metas
            </h1>
          </header>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Configuração da Meta */}
                <Card className="gaming-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Configuração da Meta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="periodo">Período da Meta</Label>
                        <Select value={periodo} onValueChange={(value: any) => setPeriodo(value)}>
                          <SelectTrigger className="gaming-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SEMANAL">Semanal</SelectItem>
                            <SelectItem value="MENSAL">Mensal</SelectItem>
                            <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valorMetaTime">Valor da Meta do Time (R$)</Label>
                        <Input
                          id="valorMetaTime"
                          type="text"
                          placeholder="0,00"
                          value={valorMetaTime}
                          onChange={(e) => setValorMetaTime(e.target.value)}
                          className="gaming-border"
                        />
                      </div>
                    </div>

                    {/* Informações calculadas */}
                    <Card className="gaming-border-accent bg-accent/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-accent" />
                            <span className="font-medium">Vendedores Ativos:</span>
                          </div>
                          <Badge variant="secondary" className="bg-accent text-accent-foreground">
                            {numVendedores}
                          </Badge>
                        </div>
                        
                        {valorMetaTime && (
                          <div className="flex items-center justify-between pt-3 border-t border-accent/20">
                            <span className="font-medium">Meta Individual:</span>
                            <span className="text-xl font-bold text-accent">
                              R$ {metaIndividual.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                {/* Bonificações */}
                <Card className="gaming-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-secondary" />
                      Bonificações por Progresso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Bonificação 1/3 */}
                    <div className="space-y-3 p-4 gaming-border-secondary rounded-lg bg-secondary/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-secondary text-secondary-foreground">1/3</Badge>
                        <span className="font-bold">Primeira Bonificação (33%)</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonus1Titulo">Título</Label>
                        <Input
                          id="bonus1Titulo"
                          placeholder="Ex: Vale Presente"
                          value={bonus1Titulo}
                          onChange={(e) => setBonus1Titulo(e.target.value)}
                          className="gaming-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonus1Desc">Descrição</Label>
                        <Textarea
                          id="bonus1Desc"
                          placeholder="Descreva a bonificação..."
                          value={bonus1Desc}
                          onChange={(e) => setBonus1Desc(e.target.value)}
                          className="gaming-border"
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Bonificação 2/3 */}
                    <div className="space-y-3 p-4 gaming-border-accent rounded-lg bg-accent/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-accent text-accent-foreground">2/3</Badge>
                        <span className="font-bold">Segunda Bonificação (66%)</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonus2Titulo">Título</Label>
                        <Input
                          id="bonus2Titulo"
                          placeholder="Ex: Dia de Folga"
                          value={bonus2Titulo}
                          onChange={(e) => setBonus2Titulo(e.target.value)}
                          className="gaming-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonus2Desc">Descrição</Label>
                        <Textarea
                          id="bonus2Desc"
                          placeholder="Descreva a bonificação..."
                          value={bonus2Desc}
                          onChange={(e) => setBonus2Desc(e.target.value)}
                          className="gaming-border"
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Bonificação 3/3 */}
                    <div className="space-y-3 p-4 gaming-border rounded-lg bg-primary/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-primary text-primary-foreground">3/3</Badge>
                        <span className="font-bold">Terceira Bonificação (100%)</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonus3Titulo">Título</Label>
                        <Input
                          id="bonus3Titulo"
                          placeholder="Ex: Bônus em Dinheiro"
                          value={bonus3Titulo}
                          onChange={(e) => setBonus3Titulo(e.target.value)}
                          className="gaming-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bonus3Desc">Descrição</Label>
                        <Textarea
                          id="bonus3Desc"
                          placeholder="Descreva a bonificação..."
                          value={bonus3Desc}
                          onChange={(e) => setBonus3Desc(e.target.value)}
                          className="gaming-border"
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 text-lg py-6"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
