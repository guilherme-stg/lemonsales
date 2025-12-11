import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Sword, Shield, Target, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import matheusAvatar from '@/assets/matheus-ironman.png';
import guilhermeAvatar from '@/assets/guilherme-wizard.png';
import brianAvatar from '@/assets/brian-archer.png';
import kilsonAvatar from '@/assets/kilson-knight.png';
interface VendedorRace {
  id: string;
  nome: string;
  faturamentoMensal: number;
  avatar_url: string | null;
}
export default function MedievalRace() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading: authLoading
  } = useAuth();
  const [vendedores, setVendedores] = useState<VendedorRace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      gameContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
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
      
      // Query original com JOIN para manter dados corretos
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
      const faturamentoPorVendedor = new Map<string, {
        nome: string;
        total: number;
        avatar_url: string | null;
      }>();
      
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

      // Criar array dos vendedores COM vendas
      const vendedoresComVendas: VendedorRace[] = Array.from(faturamentoPorVendedor.entries()).map(([id, data]) => ({
        id,
        nome: data.nome,
        faturamentoMensal: data.total,
        avatar_url: data.avatar_url
      }));

      // Buscar perfis aprovados de VENDEDOR para adicionar os que não têm vendas
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url')
        .eq('aprovado', true)
        .eq('papel', 'VENDEDOR');

      // IDs dos que já têm vendas
      const idsComVendas = new Set(vendedoresComVendas.map(v => v.id));

      // Adicionar vendedores sem vendas com R$ 0,00
      const vendedoresSemVendas: VendedorRace[] = (allProfiles || [])
        .filter(profile => !idsComVendas.has(profile.id))
        .map(profile => ({
          id: profile.id,
          nome: profile.nome,
          faturamentoMensal: 0,
          avatar_url: profile.avatar_url
        }));

      // Combinar e ordenar por faturamento
      const vendedoresArray = [...vendedoresComVendas, ...vendedoresSemVendas]
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
    return <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 p-8">
            <Skeleton className="h-12 w-64 mb-8" />
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </SidebarProvider>;
  }
  const maxFaturamento = vendedores.length > 0 ? vendedores[0].faturamentoMensal : 0;
  return <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#1a0f0a]">
        {!isFullscreen && <AppSidebar />}
        <main ref={gameContainerRef} className={`flex-1 flex flex-col overflow-hidden ${isFullscreen ? 'bg-[#1a0f0a]' : ''}`}>
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

          {/* Super Mario Style Scene Container */}
          <div className="flex-1 relative overflow-hidden">
            {/* Task List - Top Left */}
            <div className="absolute top-4 left-4 z-30">
              <div className="bg-[#f4e4c1]/95 border-2 border-[#8b6f47] rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#8b4513]" />
                  <span className="text-sm font-bold text-[#2a1810] medieval-title">MISSÃO ATUAL</span>
                </div>
                <div className="text-lg font-bold text-[#8b4513] mt-1">
                  Faturar R$ 350.000,00
                </div>
              </div>
            </div>

            {/* Fullscreen Button - Bottom Right */}
            <button
              onClick={toggleFullscreen}
              className="absolute bottom-4 right-4 z-30 bg-[#2a1810]/30 hover:bg-[#2a1810]/70 
                         border border-[#d4af37]/50 rounded-lg p-2 transition-all duration-300
                         opacity-30 hover:opacity-100"
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-[#d4af37]" />
              ) : (
                <Maximize2 className="w-5 h-5 text-[#d4af37]" />
              )}
            </button>
            {/* Parallax Background Layers */}
            <div className="absolute inset-0">
              {/* Sky Layer - Mario Blue */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#5c94fc] to-[#6ba7ff]" />
              
              {/* Clouds Far Layer */}
              <div className="absolute top-0 left-0 right-0 h-full overflow-hidden">
                <div className="absolute inset-0 mario-clouds-scroll" style={{
                width: '300%',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2400 400'%3E%3Cellipse cx='200' cy='80' rx='60' ry='40' fill='white'/%3E%3Cellipse cx='150' cy='95' rx='50' ry='35' fill='white'/%3E%3Cellipse cx='250' cy='95' rx='50' ry='35' fill='white'/%3E%3Cellipse cx='700' cy='120' rx='60' ry='40' fill='white'/%3E%3Cellipse cx='650' cy='135' rx='50' ry='35' fill='white'/%3E%3Cellipse cx='750' cy='135' rx='50' ry='35' fill='white'/%3E%3Cellipse cx='1200' cy='90' rx='60' ry='40' fill='white'/%3E%3Cellipse cx='1150' cy='105' rx='50' ry='35' fill='white'/%3E%3Cellipse cx='1250' cy='105' rx='50' ry='35' fill='white'/%3E%3Cellipse cx='1700' cy='110' rx='60' ry='40' fill='white'/%3E%3Cellipse cx='1650' cy='125' rx='50' ry='35' fill='white'/%3E%3Cellipse cx='1750' cy='125' rx='50' ry='35' fill='white'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat-x',
                backgroundSize: '2400px 400px',
                backgroundPosition: 'top'
              }} />
              </div>

              {/* Hills/Mountains Middle Layer */}
              <div className="absolute bottom-32 left-0 right-0 h-40 md:h-56 overflow-hidden">
                <div className="absolute inset-0 mario-hills-scroll" style={{
                width: '200%',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 200'%3E%3Cellipse cx='200' cy='150' rx='150' ry='80' fill='%2354b648'/%3E%3Cellipse cx='150' cy='170' rx='120' ry='60' fill='%2354b648'/%3E%3Cellipse cx='250' cy='170' rx='120' ry='60' fill='%2354b648'/%3E%3Cellipse cx='600' cy='140' rx='160' ry='85' fill='%2354b648'/%3E%3Cellipse cx='550' cy='165' rx='130' ry='65' fill='%2354b648'/%3E%3Cellipse cx='650' cy='165' rx='130' ry='65' fill='%2354b648'/%3E%3Cellipse cx='1000' cy='145' rx='155' ry='82' fill='%2354b648'/%3E%3Cellipse cx='950' cy='168' rx='125' ry='62' fill='%2354b648'/%3E%3Cellipse cx='1050' cy='168' rx='125' ry='62' fill='%2354b648'/%3E%3Cellipse cx='1400' cy='150' rx='150' ry='80' fill='%2354b648'/%3E%3Cellipse cx='1350' cy='170' rx='120' ry='60' fill='%2354b648'/%3E%3Cellipse cx='1450' cy='170' rx='120' ry='60' fill='%2354b648'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat-x',
                backgroundSize: '1600px 200px',
                backgroundPosition: 'bottom'
              }} />
              </div>

              {/* Bushes Near Layer - Higher to close gap */}
              <div className="absolute bottom-32 md:bottom-40 left-0 right-0 h-32 md:h-40 overflow-hidden">
                <div className="absolute inset-0 mario-bushes-scroll" style={{
                width: '200%',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 100'%3E%3Cellipse cx='100' cy='70' rx='50' ry='30' fill='%2343a047'/%3E%3Cellipse cx='60' cy='80' rx='40' ry='25' fill='%2343a047'/%3E%3Cellipse cx='140' cy='80' rx='40' ry='25' fill='%2343a047'/%3E%3Cellipse cx='400' cy='65' rx='55' ry='32' fill='%2343a047'/%3E%3Cellipse cx='355' cy='77' rx='45' ry='27' fill='%2343a047'/%3E%3Cellipse cx='445' cy='77' rx='45' ry='27' fill='%2343a047'/%3E%3Cellipse cx='700' cy='68' rx='52' ry='31' fill='%2343a047'/%3E%3Cellipse cx='658' cy='79' rx='42' ry='26' fill='%2343a047'/%3E%3Cellipse cx='742' cy='79' rx='42' ry='26' fill='%2343a047'/%3E%3Cellipse cx='1000' cy='70' rx='50' ry='30' fill='%2343a047'/%3E%3Cellipse cx='960' cy='80' rx='40' ry='25' fill='%2343a047'/%3E%3Cellipse cx='1040' cy='80' rx='40' ry='25' fill='%2343a047'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat-x',
                backgroundSize: '1200px 100px',
                backgroundPosition: 'bottom'
              }} />
              </div>

              {/* Ground/Floor Layer - Aligned with black line */}
              <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 overflow-hidden border-t-4 border-[#000]">
                {/* Dirt blocks - starts immediately from top (after border) */}
                <div className="absolute inset-0 mario-ground-scroll" style={{
                width: '200%',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 80'%3E%3Cdefs%3E%3Cpattern id='dirt-block' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Crect fill='%23c09050' width='40' height='40'/%3E%3Crect fill='%23a0703a' x='1' y='1' width='38' height='38'/%3E%3Ccircle fill='%238b5a2b' cx='10' cy='10' r='2'/%3E%3Ccircle fill='%238b5a2b' cx='25' cy='15' r='1.5'/%3E%3Ccircle fill='%238b5a2b' cx='15' cy='28' r='2'/%3E%3Ccircle fill='%238b5a2b' cx='30' cy='30' r='1.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23dirt-block)' width='800' height='80'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '800px 80px',
                backgroundPosition: 'top'
              }} />
              </div>

              {/* NO decorative elements - removed pipes, floating blocks and dragon */}
              <div className="hidden" />
            </div>

            {/* Empty State */}
            {vendedores.length === 0 ? <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center animate-fade-in px-4">
                  <Shield className="w-16 h-16 md:w-24 md:h-24 text-[#d4af37] mx-auto mb-4 animate-pulse" />
                  <h2 className="text-xl md:text-3xl font-bold text-[#d4af37] mb-2 medieval-title">
                    A Corrida Ainda Não Começou!
                  </h2>
                  <p className="text-base md:text-lg text-[#f4e4c1] max-w-md mx-auto">
                    Aguardando os guerreiros registrarem suas conquistas de vendas aprovadas...
                  </p>
                  <div className="mt-6 flex justify-center gap-4">
                    <Sword className="w-8 h-8 text-[#8b4513] animate-bounce" style={{
                  animationDelay: '0s'
                }} />
                    <Sword className="w-8 h-8 text-[#8b4513] animate-bounce" style={{
                  animationDelay: '0.2s'
                }} />
                    <Sword className="w-8 h-8 text-[#8b4513] animate-bounce" style={{
                  animationDelay: '0.4s'
                }} />
                  </div>
                </div>
              </div> : (/* Characters Layer - FIXED: Now anchored to raised ground */
          <div className="absolute bottom-40 md:bottom-48 left-0 right-0 h-32 md:h-40 z-10">
                <div className="relative w-full h-full pb-0 px-0 py-[146px] mx-0 my-[83px]">
                  {vendedores.map((vendedor, index) => {
                // Calcular posição X baseada no faturamento
                const progresso = maxFaturamento > 0 ? vendedor.faturamentoMensal / maxFaturamento : 0;
                const posX = 10 + progresso * 70; // 10% a 80% da largura
                const isLeader = index === 0;
                
                // Calcular quantos vendedores anteriores estão em posição similar (dentro de 8% de distância)
                let stackLevel = 0;
                for (let i = 0; i < index; i++) {
                  const prevProgresso = maxFaturamento > 0 ? vendedores[i].faturamentoMensal / maxFaturamento : 0;
                  const prevPosX = 10 + prevProgresso * 70;
                  if (Math.abs(posX - prevPosX) < 8) {
                    stackLevel++;
                  }
                }
                
                // Offset para empilhar balões quando posições são similares
                const bubbleOffset = stackLevel * 70;
                
                return <CharacterWithBubble key={vendedor.id} vendedorId={vendedor.id} nome={vendedor.nome} faturamento={vendedor.faturamentoMensal} posX={posX} isLeader={isLeader} avatarUrl={vendedor.avatar_url} bubbleOffset={bubbleOffset} zIndex={index === 0 ? 100 : 50 - index} />;
              })}
                </div>
              </div>)}

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
          100% { transform: translateX(-33.33%); }
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
        
        /* Mario Style Animations - 3x FASTER */
        .mario-clouds-scroll {
          animation: scroll-parallax-far 40s linear infinite;
        }
        
        .mario-hills-scroll {
          animation: scroll-parallax-mid 25s linear infinite;
        }
        
        .mario-bushes-scroll {
          animation: scroll-parallax-near 18s linear infinite;
        }
        
        .mario-ground-scroll {
          animation: scroll-parallax-near 15s linear infinite;
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
    </SidebarProvider>;
}

// Array de avatares disponíveis para seleção aleatória
const AVAILABLE_AVATARS = [matheusAvatar, guilhermeAvatar, brianAvatar, kilsonAvatar];

// Função para selecionar avatar aleatório baseado no ID (determinístico)
const getRandomAvatar = (vendedorId: string) => {
  let hash = 0;
  for (let i = 0; i < vendedorId.length; i++) {
    hash = ((hash << 5) - hash) + vendedorId.charCodeAt(i);
    hash = hash & hash;
  }
  return AVAILABLE_AVATARS[Math.abs(hash) % AVAILABLE_AVATARS.length];
};

interface CharacterProps {
  vendedorId: string;
  nome: string;
  faturamento: number;
  posX: number;
  isLeader: boolean;
  avatarUrl: string | null;
  bubbleOffset: number;
  zIndex: number;
}

function CharacterWithBubble({
  vendedorId,
  nome,
  faturamento,
  posX,
  isLeader,
  avatarUrl,
  bubbleOffset,
  zIndex
}: CharacterProps) {
  const nomeExibicao = nome.length > 12 ? nome.substring(0, 12) + '...' : nome;
  const faturamentoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(faturamento);

  // Determinar qual avatar usar
  const nomeLower = nome.toLowerCase();
  const isMatheus = nomeLower.includes('matheus');
  const isGuilherme = nomeLower.includes('guilherme');
  const isBrian = nomeLower.includes('brian');
  const isKilson = nomeLower.includes('kilson');

  // Selecionar avatar: específico ou aleatório
  const selectedAvatar = isMatheus ? matheusAvatar 
    : isGuilherme ? guilhermeAvatar 
    : isBrian ? brianAvatar 
    : isKilson ? kilsonAvatar 
    : getRandomAvatar(vendedorId);

  return (
    <div 
      className="absolute bottom-0 transition-all duration-1000 ease-out flex flex-col items-center" 
      style={{
        left: `${posX}%`,
        transform: 'translateX(-50%)',
        zIndex,
        animation: 'character-enter 0.8s ease-out'
      }}
    >
      {/* Speech Bubble - com offset para evitar sobreposição */}
      <div className="mb-2 md:mb-3 whitespace-nowrap" style={{
        animation: 'float-bubble 3s ease-in-out infinite',
        marginBottom: `${bubbleOffset + 8}px`
      }}>
        <div className="relative bg-[#f4e4c1] border-2 md:border-4 border-[#8b6f47] rounded-lg px-2 py-1.5 md:px-4 md:py-3 shadow-lg">
          {/* Ícone de exclamação para quem não tem vendas */}
          {faturamento === 0 && (
            <div className="absolute -top-2 -right-2 bg-[#dc2626] rounded-full p-0.5 border border-[#991b1b]">
              <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
          )}
          <div className="text-center">
            <div className="text-xs md:text-sm font-bold text-[#2a1810] mb-0.5 md:mb-1">{nomeExibicao}</div>
            <div className={`text-sm md:text-lg font-bold ${faturamento === 0 ? 'text-[#dc2626]' : 'text-[#8b4513]'}`}>
              {faturamentoFormatado}
            </div>
          </div>
          {/* Bubble tail */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] md:border-l-8 border-r-[6px] md:border-r-8 border-t-[6px] md:border-t-8 border-transparent border-t-[#8b6f47]" />
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] md:border-l-6 border-r-[4px] md:border-r-6 border-t-[4px] md:border-t-6 border-transparent border-t-[#f4e4c1] mt-[-1px] md:mt-[-2px]" />
        </div>
      </div>

      {/* Character - Todos usam avatares de imagem agora */}
      <div className="relative" style={{
        animation: 'walk 1s ease-in-out infinite',
        transform: 'translateY(386px)'
      }}>
        <div className="flex flex-col items-center">
          <img 
            src={selectedAvatar} 
            alt={nome} 
            className="w-16 md:w-20 object-contain hover:scale-110 transition-transform" 
            style={{
              height: '120px',
              filter: isLeader ? 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))' : undefined
            }} 
          />
        </div>
      </div>
    </div>
  );
}