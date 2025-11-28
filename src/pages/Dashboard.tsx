import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { XPBar } from '@/components/gaming/XPBar';
import { StatCard } from '@/components/gaming/StatCard';
import { Trophy, DollarSign, Target, LogOut, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  nome: string;
  xp_total: number;
  pontos_total: number;
  nivel_atual: number;
}

export default function Dashboard() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast.error('Erro ao carregar perfil');
      return;
    }

    setProfile(data);
  };

  const getXPForLevel = (level: number): number => {
    const xpLevels = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3700, 4800];
    return xpLevels[level] || 5000;
  };

  const getXPProgress = () => {
    if (!profile) return { current: 0, max: 100 };
    const currentLevelXP = getXPForLevel(profile.nivel_atual - 1);
    const nextLevelXP = getXPForLevel(profile.nivel_atual);
    const currentXP = profile.xp_total - currentLevelXP;
    const maxXP = nextLevelXP - currentLevelXP;
    return { current: currentXP, max: maxXP };
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-glow">
          <Trophy className="w-16 h-16 text-primary" />
        </div>
      </div>
    );
  }

  const xpProgress = getXPProgress();

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-holographic bg-clip-text text-transparent">
              GameSales
            </h1>
            <p className="text-muted-foreground">Arena de Vendas</p>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="gaming-border"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Player Card */}
        <div className="gaming-border rounded-lg p-8 bg-gradient-card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-1">
                {profile.nome}
              </h2>
              <p className="text-muted-foreground">Vendedor</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">
                {profile.pontos_total}
              </div>
              <div className="text-sm text-muted-foreground">Pontos Totais</div>
            </div>
          </div>
          
          <XPBar
            currentXP={xpProgress.current}
            maxXP={xpProgress.max}
            level={profile.nivel_atual}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pontos Hoje"
            value={profile.pontos_total}
            icon={Trophy}
            gradient="primary"
          />
          <StatCard
            title="Vendas Hoje"
            value={0}
            icon={DollarSign}
            gradient="secondary"
            subtitle="R$ 0,00"
          />
          <StatCard
            title="Posição no Ranking"
            value="#1"
            icon={TrendingUp}
            gradient="accent"
          />
          <StatCard
            title="Meta Diária"
            value="0/3"
            icon={Target}
            gradient="primary"
            subtitle="vendas"
          />
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Button
            className="h-32 text-2xl font-bold bg-gradient-primary hover:opacity-90 gaming-border"
            onClick={() => toast.info('Funcionalidade em desenvolvimento')}
          >
            <DollarSign className="w-8 h-8 mr-3" />
            Registrar Venda
          </Button>
          <Button
            variant="outline"
            className="h-32 text-2xl font-bold gaming-border hover-lift"
            onClick={() => toast.info('Funcionalidade em desenvolvimento')}
          >
            <Trophy className="w-8 h-8 mr-3" />
            Ver Conquistas
          </Button>
        </div>

        {/* Quick Info */}
        <div className="gaming-border rounded-lg p-6 bg-card/50">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Missões de Hoje
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-muted/30">
              <span className="text-sm">Realizar 3 vendas hoje</span>
              <span className="text-sm font-bold text-accent">0/3</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-muted/30">
              <span className="text-sm">Atingir R$ 5.000 na semana</span>
              <span className="text-sm font-bold text-secondary">R$ 0 / R$ 5.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
