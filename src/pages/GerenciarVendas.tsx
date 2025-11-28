import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShoppingCart, Edit, X, Search } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Venda {
  id: string;
  cliente: string;
  valor: number;
  data_venda: string;
  status: string;
  tipo_venda: string;
  pontos_totais: number;
  observacoes: string | null;
  usuario_id: string;
  profiles: {
    nome: string;
  };
  produtos: {
    nome: string;
  } | null;
}

export default function GerenciarVendas() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [filteredVendas, setFilteredVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVenda, setEditingVenda] = useState<Venda | null>(null);
  const [editForm, setEditForm] = useState({
    cliente: '',
    valor: 0,
    observacoes: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && profile && profile.papel !== 'MASTER' && profile.papel !== 'GESTOR') {
      navigate('/rankings');
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (profile && (profile.papel === 'MASTER' || profile.papel === 'GESTOR')) {
      loadVendas();
    }
  }, [profile]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = vendas.filter(venda => 
        venda.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venda.profiles.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (venda.produtos?.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVendas(filtered);
    } else {
      setFilteredVendas(vendas);
    }
  }, [searchTerm, vendas]);

  const loadVendas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          profiles!vendas_usuario_id_fkey(nome),
          produtos(nome)
        `)
        .order('data_venda', { ascending: false });

      if (error) {
        console.error('Error loading vendas:', error);
        toast.error('Erro ao carregar vendas');
      } else {
        setVendas(data || []);
        setFilteredVendas(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Erro inesperado ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (venda: Venda) => {
    setEditingVenda(venda);
    setEditForm({
      cliente: venda.cliente,
      valor: venda.valor,
      observacoes: venda.observacoes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingVenda) return;

    try {
      const { error } = await supabase
        .from('vendas')
        .update({
          cliente: editForm.cliente,
          valor: editForm.valor,
          observacoes: editForm.observacoes || null,
        })
        .eq('id', editingVenda.id);

      if (error) {
        console.error('Error updating venda:', error);
        toast.error('Erro ao atualizar venda');
      } else {
        toast.success('Venda atualizada com sucesso!');
        setEditingVenda(null);
        loadVendas();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Erro inesperado ao atualizar venda');
    }
  };

  const handleCancelVenda = async (vendaId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta venda?')) return;

    try {
      const { error } = await supabase
        .from('vendas')
        .update({ status: 'REJEITADA' })
        .eq('id', vendaId);

      if (error) {
        console.error('Error canceling venda:', error);
        toast.error('Erro ao cancelar venda');
      } else {
        toast.success('Venda cancelada com sucesso!');
        loadVendas();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Erro inesperado ao cancelar venda');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      APROVADA: 'default',
      PENDENTE: 'secondary',
      REJEITADA: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getTipoVendaBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      NOVA: 'Nova',
      UPSELL: 'Upsell',
      CROSS_SELL: 'Cross-sell',
      RENOVACAO: 'Renovação',
    };
    return <Badge variant="outline">{labels[tipo] || tipo}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-primary animate-pulse" />
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
              Gerenciar Vendas
            </h1>
          </header>

          <main className="flex-1 p-6">
            <Card className="gaming-border">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Histórico de Vendas
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar vendas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 gaming-border"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border gaming-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Pontos</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground">
                            Nenhuma venda encontrada
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVendas.map((venda) => (
                          <TableRow key={venda.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(venda.data_venda), 'dd/MM/yyyy', { locale: ptBR })}
                            </TableCell>
                            <TableCell>{venda.profiles.nome}</TableCell>
                            <TableCell>{venda.cliente}</TableCell>
                            <TableCell>{venda.produtos?.nome || '-'}</TableCell>
                            <TableCell>{getTipoVendaBadge(venda.tipo_venda)}</TableCell>
                            <TableCell>R$ {venda.valor.toFixed(2)}</TableCell>
                            <TableCell>{venda.pontos_totais}</TableCell>
                            <TableCell>{getStatusBadge(venda.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(venda)}
                                  disabled={venda.status === 'REJEITADA'}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {venda.status !== 'REJEITADA' && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleCancelVenda(venda.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <Dialog open={!!editingVenda} onOpenChange={() => setEditingVenda(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Venda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                value={editForm.cliente}
                onChange={(e) => setEditForm({ ...editForm, cliente: e.target.value })}
                className="gaming-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={editForm.valor}
                onChange={(e) => setEditForm({ ...editForm, valor: parseFloat(e.target.value) })}
                className="gaming-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                value={editForm.observacoes}
                onChange={(e) => setEditForm({ ...editForm, observacoes: e.target.value })}
                className="gaming-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVenda(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="bg-gradient-primary">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
