import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Sword, Shield, Flame } from 'lucide-react';

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
          {/* Elaborate Medieval Banner Header */}
          <div className="relative z-10 p-4 md:p-6">
            <div className="relative bg-gradient-to-b from-[#8b4513] via-[#6b3410] to-[#4b2810] border-4 border-[#d4af37] rounded-lg shadow-2xl">
              {/* Decorative corners */}
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-[#d4af37] rotate-45 border-2 border-[#8b6f47]" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#d4af37] rotate-45 border-2 border-[#8b6f47]" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-[#d4af37] rotate-45 border-2 border-[#8b6f47]" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#d4af37] rotate-45 border-2 border-[#8b6f47]" />
              
              <div className="flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 px-4">
                <Sword className="w-6 h-6 md:w-8 md:h-8 text-[#d4af37] animate-pulse" />
                <h1 className="text-2xl md:text-4xl font-bold text-[#d4af37] text-center medieval-title drop-shadow-lg">
                  Corrida dos Heróis do Mês
                </h1>
                <Sword className="w-6 h-6 md:w-8 md:h-8 text-[#d4af37] scale-x-[-1] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Medieval Scene Container */}
          <div className="flex-1 relative overflow-hidden">
            {/* Parallax Background Layers */}
            <div className="absolute inset-0">
              {/* Sky Layer with stars */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#3a2a4a] via-[#5a3a5a] to-[#2a1810]">
                {/* Subtle stars */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                                   radial-gradient(2px 2px at 60% 70%, white, transparent),
                                   radial-gradient(1px 1px at 50% 50%, white, transparent),
                                   radial-gradient(1px 1px at 80% 10%, white, transparent),
                                   radial-gradient(2px 2px at 90% 60%, white, transparent)`,
                  backgroundSize: '200px 200px'
                }} />
              </div>
              
              {/* Mountains/Castles Far */}
              <div className="absolute bottom-0 left-0 right-0 h-48 md:h-64 overflow-hidden">
                <div className="absolute inset-0 medieval-far-scroll" 
                     style={{ 
                       width: '200%',
                       backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 200'%3E%3Cpath fill='%231a0a1a' opacity='0.6' d='M0,200 L0,150 L100,120 L150,140 L200,100 L300,130 L400,90 L500,120 L600,100 L700,130 L800,110 L900,125 L1000,95 L1100,115 L1200,105 L1300,120 L1400,100 L1500,125 L1600,110 L1600,200 Z'/%3E%3C/svg%3E")`,
                       backgroundRepeat: 'repeat-x',
                       backgroundSize: '1600px 200px',
                       backgroundPosition: 'bottom'
                     }} 
                />
              </div>

              {/* Trees/Walls Middle */}
              <div className="absolute bottom-0 left-0 right-0 h-36 md:h-48 overflow-hidden">
                <div className="absolute inset-0 medieval-mid-scroll"
                     style={{
                       width: '200%',
                       backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 150'%3E%3Cpath fill='%232a1a1a' opacity='0.8' d='M0,150 L0,100 L50,80 L100,110 L150,70 L200,100 L250,60 L300,90 L350,80 L400,100 L450,70 L500,95 L550,85 L600,100 L650,75 L700,105 L750,80 L800,95 L850,70 L900,100 L950,85 L1000,95 L1050,80 L1100,100 L1200,90 L1200,150 Z'/%3E%3C/svg%3E")`,
                       backgroundRepeat: 'repeat-x',
                       backgroundSize: '1200px 150px',
                       backgroundPosition: 'bottom'
                     }}
                />
              </div>

              {/* Ground Layer */}
              <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 overflow-hidden">
                <div className="absolute inset-0 medieval-near-scroll" 
                     style={{
                       width: '200%',
                       backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 80'%3E%3Crect fill='%233a2a1a' width='800' height='80'/%3E%3Cpath fill='%232a1a0a' d='M0,20 Q100,10 200,20 T400,20 T600,20 T800,20 L800,80 L0,80 Z'/%3E%3C/svg%3E")`,
                       backgroundRepeat: 'repeat-x',
                       backgroundSize: '800px 80px',
                       backgroundPosition: 'bottom'
                     }}
                />
              </div>

              {/* Decorative Elements */}
              <DecorativeElements />
            </div>

            {/* Empty State */}
            {vendedores.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center animate-fade-in px-4">
                  <Shield className="w-16 h-16 md:w-24 md:h-24 text-[#d4af37] mx-auto mb-4 animate-pulse" />
                  <h2 className="text-xl md:text-3xl font-bold text-[#d4af37] mb-2 medieval-title">
                    A Corrida Ainda Não Começou!
                  </h2>
                  <p className="text-base md:text-lg text-[#f4e4c1] max-w-md mx-auto">
                    Aguardando os guerreiros registrarem suas conquistas de vendas aprovadas...
                  </p>
                  <div className="mt-6 flex justify-center gap-4">
                    <Sword className="w-8 h-8 text-[#8b4513] animate-bounce" style={{ animationDelay: '0s' }} />
                    <Sword className="w-8 h-8 text-[#8b4513] animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <Sword className="w-8 h-8 text-[#8b4513] animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            ) : (
              /* Characters Layer */
              <div className="absolute inset-0 flex items-end pb-24 md:pb-32 z-10">
                <div className="relative w-full h-48 md:h-64">
                  {vendedores.map((vendedor, index) => {
                    const progresso = maxFaturamento > 0 ? vendedor.faturamentoMensal / maxFaturamento : 0;
                    const posX = 10 + progresso * 70; // 10% a 80% da largura
                    const isLeader = index === 0;
                    // Offset vertical para evitar sobreposição
                    const verticalOffset = (index % 3) * 12;
                    
                    return (
                      <CharacterWithBubble
                        key={vendedor.id}
                        vendedorId={vendedor.id}
                        nome={vendedor.nome}
                        faturamento={vendedor.faturamentoMensal}
                        posX={posX}
                        isLeader={isLeader}
                        avatarUrl={vendedor.avatar_url}
                        verticalOffset={verticalOffset}
                        zIndex={index === 0 ? 100 : 50 - index}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Legend */}
            <div className="absolute bottom-2 left-0 right-0 z-20 text-center">
              <p className="text-xs md:text-sm text-[#d4af37]/70 medieval-title">
                🏆 Posição baseada no faturamento mensal aprovado
              </p>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes scroll-parallax-far {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes scroll-parallax-mid {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes scroll-parallax-near {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes walk {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes float-bubble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes torch-flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          25% { opacity: 0.8; transform: scale(1.05); }
          50% { opacity: 1; transform: scale(0.95); }
          75% { opacity: 0.9; transform: scale(1.02); }
        }

        @keyframes character-enter {
          0% { 
            opacity: 0;
            transform: translateX(-100px) translateY(20px);
          }
          100% { 
            opacity: 1;
            transform: translateX(0) translateY(0);
          }
        }
        
        .medieval-far-scroll {
          animation: scroll-parallax-far 120s linear infinite;
        }
        
        .medieval-mid-scroll {
          animation: scroll-parallax-mid 80s linear infinite;
        }
        
        .medieval-near-scroll {
          animation: scroll-parallax-near 50s linear infinite;
        }
        
        .medieval-title {
          text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);
          font-family: 'Georgia', serif;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .medieval-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </SidebarProvider>
  );
}

// Medieval character icons
const MEDIEVAL_ICONS = ['🛡️', '⚔️', '🏹', '🪓', '🗡️', '⚔️'];
const CHARACTER_COLORS = ['#8b4513', '#a0522d', '#6b4423', '#8b6f47', '#704214'];

interface CharacterProps {
  vendedorId: string;
  nome: string;
  faturamento: number;
  posX: number;
  isLeader: boolean;
  avatarUrl: string | null;
  verticalOffset: number;
  zIndex: number;
}

function CharacterWithBubble({ vendedorId, nome, faturamento, posX, isLeader, avatarUrl, verticalOffset, zIndex }: CharacterProps) {
  const nomeExibicao = nome.length > 12 ? nome.substring(0, 12) + '...' : nome;
  const faturamentoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(faturamento);

  // Selecionar ícone e cor baseado no vendedorId para consistência
  const iconIndex = vendedorId.charCodeAt(0) % MEDIEVAL_ICONS.length;
  const colorIndex = vendedorId.charCodeAt(1) % CHARACTER_COLORS.length;
  const characterIcon = MEDIEVAL_ICONS[iconIndex];
  const characterColor = isLeader ? '#d4af37' : CHARACTER_COLORS[colorIndex];

  return (
    <div 
      className="absolute bottom-0 transition-all duration-1000 ease-out"
      style={{ 
        left: `${posX}%`, 
        transform: 'translateX(-50%)',
        bottom: `${verticalOffset}px`,
        zIndex,
        animation: 'character-enter 0.8s ease-out'
      }}
    >
      {/* Speech Bubble */}
      <div 
        className="absolute bottom-full mb-12 md:mb-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
        style={{ animation: 'float-bubble 3s ease-in-out infinite' }}
      >
        <div className="relative bg-[#f4e4c1] border-2 md:border-4 border-[#8b6f47] rounded-lg px-2 py-1.5 md:px-4 md:py-3 shadow-lg">
          <div className="text-center">
            <div className="text-xs md:text-sm font-bold text-[#2a1810] mb-0.5 md:mb-1">{nomeExibicao}</div>
            <div className="text-sm md:text-lg font-bold text-[#8b4513]">{faturamentoFormatado}</div>
          </div>
          {/* Bubble tail */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] md:border-l-8 border-r-[6px] md:border-r-8 border-t-[6px] md:border-t-8 border-transparent border-t-[#8b6f47]" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] md:border-l-6 border-r-[4px] md:border-r-6 border-t-[4px] md:border-t-6 border-transparent border-t-[#f4e4c1] mt-[-1px] md:mt-[-2px]" />
        </div>
      </div>

      {/* Character */}
      <div 
        className="relative"
        style={{ animation: 'walk 1s ease-in-out infinite' }}
      >
        {/* Crown for leader with glow */}
        {isLeader && (
          <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-2xl md:text-3xl animate-pulse">
            👑
          </div>
        )}
        
        {/* Character body */}
        <div 
          className="w-12 h-16 md:w-16 md:h-20 rounded-t-full border-2 md:border-4 border-[#5a3a1a] relative flex items-center justify-center shadow-xl transition-all hover:scale-110"
          style={{ 
            backgroundColor: characterColor,
            boxShadow: isLeader ? '0 0 20px rgba(212, 175, 55, 0.6)' : undefined
          }}
        >
          {/* Avatar or Icon */}
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={nome}
              className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover"
            />
          ) : (
            <div className="text-xl md:text-3xl">{characterIcon}</div>
          )}
          
          {/* Arms */}
          <div className="absolute -left-2 md:-left-3 top-4 md:top-6 w-4 h-2 md:w-6 md:h-3 bg-[#8b4513] rounded-full border border-[#5a3a1a] md:border-2" />
          <div className="absolute -right-2 md:-right-3 top-4 md:top-6 w-4 h-2 md:w-6 md:h-3 bg-[#8b4513] rounded-full border border-[#5a3a1a] md:border-2" />
        </div>
        
        {/* Legs */}
        <div className="flex justify-center gap-1 md:gap-2 mt-0.5 md:mt-1">
          <div className="w-2 h-5 md:w-3 md:h-8 bg-[#5a3a1a] rounded-b-lg border border-[#3a2a0a] md:border-2" />
          <div className="w-2 h-5 md:w-3 md:h-8 bg-[#5a3a1a] rounded-b-lg border border-[#3a2a0a] md:border-2" />
        </div>
      </div>
    </div>
  );
}

// Decorative medieval elements
function DecorativeElements() {
  return (
    <>
      {/* Torches */}
      <div className="absolute bottom-32 left-[5%] hidden md:block z-5">
        <Torch />
      </div>
      <div className="absolute bottom-32 left-[25%] hidden lg:block z-5">
        <Torch delay={0.5} />
      </div>
      <div className="absolute bottom-32 right-[25%] hidden lg:block z-5">
        <Torch delay={1} />
      </div>
      <div className="absolute bottom-32 right-[5%] hidden md:block z-5">
        <Torch delay={1.5} />
      </div>

      {/* Barrels and Rocks */}
      <div className="absolute bottom-24 left-[15%] w-6 h-8 md:w-8 md:h-10 bg-[#4b2810] border-2 border-[#2a1810] rounded-sm hidden md:block" />
      <div className="absolute bottom-24 right-[15%] w-8 h-6 md:w-10 md:h-8 bg-[#5a5a5a] border-2 border-[#3a3a3a] rounded-lg hidden md:block" />
      <div className="absolute bottom-24 left-[45%] w-5 h-5 md:w-6 md:h-6 bg-[#6a6a6a] border-2 border-[#4a4a4a] rounded-full hidden lg:block" />
    </>
  );
}

function Torch({ delay = 0 }: { delay?: number }) {
  return (
    <div className="relative">
      {/* Torch post */}
      <div className="w-2 md:w-3 h-16 md:h-20 bg-[#4b2810] border border-[#2a1810] md:border-2 mx-auto" />
      {/* Flame */}
      <div 
        className="absolute -top-2 left-1/2 -translate-x-1/2"
        style={{ 
          animation: 'torch-flicker 2s ease-in-out infinite',
          animationDelay: `${delay}s`
        }}
      >
        <Flame className="w-4 h-5 md:w-6 md:h-8 text-orange-500" />
        <div className="absolute inset-0 blur-md bg-orange-400/40 rounded-full" />
      </div>
    </div>
  );
}
