import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Sword } from 'lucide-react';

interface VendedorRace {
  id: string;
  nome: string;
  faturamentoMensal: number;
  avatar_url: string | null;
}

export default function MedievalRace() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [vendedores, setVendedores] = useState<VendedorRace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (!authLoading && profile && !profile.aprovado) {
      navigate('/aguardando-aprovacao');
      return;
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (user && profile?.aprovado) {
      loadVendedoresData();
    }
  }, [user, profile]);

  const loadVendedoresData = async () => {
    try {
      setLoading(true);
      
      // Buscar faturamento mensal de cada vendedor
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { data: vendas, error } = await supabase
        .from('vendas')
        .select(`
          usuario_id,
          valor,
          profiles!inner(id, nome, avatar_url)
        `)
        .eq('status', 'APROVADA')
        .gte('data_venda', firstDayOfMonth.toISOString())
        .lte('data_venda', lastDayOfMonth.toISOString());

      if (error) throw error;

      // Agrupar por vendedor e somar faturamento
      const faturamentoPorVendedor = new Map<string, { nome: string; total: number; avatar_url: string | null }>();

      vendas?.forEach((venda: any) => {
        const vendedorId = venda.usuario_id;
        const vendedorNome = venda.profiles.nome;
        const vendedorAvatar = venda.profiles.avatar_url;
        
        if (!faturamentoPorVendedor.has(vendedorId)) {
          faturamentoPorVendedor.set(vendedorId, {
            nome: vendedorNome,
            total: 0,
            avatar_url: vendedorAvatar
          });
        }
        
        const current = faturamentoPorVendedor.get(vendedorId)!;
        current.total += Number(venda.valor);
      });

      // Converter para array e ordenar por faturamento (maior para menor)
      const vendedoresArray: VendedorRace[] = Array.from(faturamentoPorVendedor.entries())
        .map(([id, data]) => ({
          id,
          nome: data.nome,
          faturamentoMensal: data.total,
          avatar_url: data.avatar_url
        }))
        .sort((a, b) => b.faturamentoMensal - a.faturamentoMensal);

      setVendedores(vendedoresArray);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da corrida');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 p-8">
            <Skeleton className="h-12 w-64 mb-8" />
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const maxFaturamento = vendedores.length > 0 ? vendedores[0].faturamentoMensal : 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#1a0f0a]">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="relative z-10 p-6 bg-gradient-to-b from-[#2a1810]/90 to-transparent">
            <div className="flex items-center justify-center gap-3">
              <Sword className="w-8 h-8 text-[#d4af37]" />
              <h1 className="text-4xl font-bold text-[#d4af37] text-center medieval-title">
                Corrida dos Heróis do Mês
              </h1>
              <Sword className="w-8 h-8 text-[#d4af37] scale-x-[-1]" />
            </div>
          </div>

          {/* Medieval Scene Container */}
          <div className="flex-1 relative overflow-hidden">
            {/* Parallax Background Layers */}
            <div className="absolute inset-0">
              {/* Sky Layer */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#3a2a4a] via-[#5a3a5a] to-[#2a1810]" />
              
              {/* Mountains/Castles Far */}
              <div className="absolute bottom-0 left-0 right-0 h-64 parallax-far">
                <div className="absolute inset-0 bg-repeat-x bg-bottom medieval-far" 
                     style={{ 
                       backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 200'%3E%3Cpath fill='%231a0a1a' opacity='0.5' d='M0,200 L0,150 L100,120 L150,140 L200,100 L300,130 L400,90 L500,120 L600,100 L700,130 L800,110 L800,200 Z'/%3E%3C/svg%3E")`,
                       backgroundSize: '800px 200px'
                     }} 
                />
              </div>

              {/* Trees/Walls Middle */}
              <div className="absolute bottom-0 left-0 right-0 h-48 parallax-mid">
                <div className="absolute inset-0 bg-repeat-x bg-bottom medieval-mid"
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 150'%3E%3Cpath fill='%232a1a1a' opacity='0.7' d='M0,150 L0,100 L50,80 L100,110 L150,70 L200,100 L250,60 L300,90 L350,80 L400,100 L450,70 L500,95 L550,85 L600,100 L600,150 Z'/%3E%3C/svg%3E")`,
                       backgroundSize: '600px 150px'
                     }}
                />
              </div>

              {/* Ground Layer */}
              <div className="absolute bottom-0 left-0 right-0 h-32 parallax-near">
                <div className="absolute inset-0 bg-repeat-x bg-bottom" 
                     style={{
                       backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 80'%3E%3Crect fill='%233a2a1a' width='400' height='80'/%3E%3Cpath fill='%232a1a0a' d='M0,20 Q100,10 200,20 T400,20 L400,80 L0,80 Z'/%3E%3C/svg%3E")`,
                       backgroundSize: '400px 80px'
                     }}
                />
              </div>
            </div>

            {/* Characters Layer */}
            <div className="absolute inset-0 flex items-end pb-32 z-10">
              <div className="relative w-full h-64">
                {vendedores.map((vendedor, index) => {
                  const progresso = maxFaturamento > 0 ? vendedor.faturamentoMensal / maxFaturamento : 0;
                  const posX = 10 + progresso * 70; // 10% a 80% da largura
                  const isLeader = index === 0;
                  
                  return (
                    <CharacterWithBubble
                      key={vendedor.id}
                      nome={vendedor.nome}
                      faturamento={vendedor.faturamentoMensal}
                      posX={posX}
                      isLeader={isLeader}
                      avatarUrl={vendedor.avatar_url}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes scroll-far {
          0% { transform: translateX(0); }
          100% { transform: translateX(-800px); }
        }
        
        @keyframes scroll-mid {
          0% { transform: translateX(0); }
          100% { transform: translateX(-600px); }
        }
        
        @keyframes scroll-near {
          0% { transform: translateX(0); }
          100% { transform: translateX(-400px); }
        }
        
        @keyframes walk {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes float-bubble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        .parallax-far .medieval-far {
          animation: scroll-far 60s linear infinite;
        }
        
        .parallax-mid .medieval-mid {
          animation: scroll-mid 40s linear infinite;
        }
        
        .parallax-near {
          animation: scroll-near 25s linear infinite;
        }
        
        .medieval-title {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          font-family: 'Georgia', serif;
        }
      `}</style>
    </SidebarProvider>
  );
}

interface CharacterProps {
  nome: string;
  faturamento: number;
  posX: number;
  isLeader: boolean;
  avatarUrl: string | null;
}

function CharacterWithBubble({ nome, faturamento, posX, isLeader, avatarUrl }: CharacterProps) {
  const nomeExibicao = nome.length > 14 ? nome.substring(0, 14) + '...' : nome;
  const faturamentoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(faturamento);

  return (
    <div 
      className="absolute bottom-0 transition-all duration-1000 ease-out"
      style={{ left: `${posX}%`, transform: 'translateX(-50%)' }}
    >
      {/* Speech Bubble */}
      <div 
        className="absolute bottom-full mb-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
        style={{ animation: 'float-bubble 3s ease-in-out infinite' }}
      >
        <div className="relative bg-[#f4e4c1] border-4 border-[#8b6f47] rounded-lg px-4 py-3 shadow-lg">
          <div className="text-center">
            <div className="text-sm font-bold text-[#2a1810] mb-1">{nomeExibicao}</div>
            <div className="text-lg font-bold text-[#8b4513]">{faturamentoFormatado}</div>
          </div>
          {/* Bubble tail */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-[#8b6f47]" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-[#f4e4c1] mt-[-2px]" style={{ borderLeftWidth: '6px', borderRightWidth: '6px', borderTopWidth: '6px' }} />
        </div>
      </div>

      {/* Character */}
      <div 
        className="relative"
        style={{ animation: 'walk 1s ease-in-out infinite' }}
      >
        {/* Crown for leader */}
        {isLeader && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl">👑</div>
        )}
        
        {/* Character body */}
        <div className={`w-16 h-20 rounded-t-full ${isLeader ? 'bg-[#d4af37]' : 'bg-[#8b4513]'} border-4 border-[#5a3a1a] relative flex items-center justify-center shadow-lg`}>
          {/* Avatar or Icon */}
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={nome}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="text-3xl">🛡️</div>
          )}
          
          {/* Arms */}
          <div className="absolute -left-3 top-6 w-6 h-3 bg-[#8b4513] rounded-full border-2 border-[#5a3a1a]" />
          <div className="absolute -right-3 top-6 w-6 h-3 bg-[#8b4513] rounded-full border-2 border-[#5a3a1a]" />
        </div>
        
        {/* Legs */}
        <div className="flex justify-center gap-2 mt-1">
          <div className="w-3 h-8 bg-[#5a3a1a] rounded-b-lg border-2 border-[#3a2a0a]" />
          <div className="w-3 h-8 bg-[#5a3a1a] rounded-b-lg border-2 border-[#3a2a0a]" />
        </div>
      </div>
    </div>
  );
}
