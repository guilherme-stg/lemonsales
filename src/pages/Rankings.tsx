import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface RankingUser {
  id: string;
  nome: string;
  pontos_total: number;
  nivel_atual: number;
  avatar_url?: string;
}

export default function Rankings() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadRankings();
    }
  }, [user]);

  // Setup realtime subscription for profile updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('rankings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          // Reload rankings when any profile changes
          loadRankings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadRankings = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, pontos_total, nivel_atual, avatar_url')
      .eq('aprovado', true)
      .order('pontos_total', { ascending: false })
      .limit(20);

    if (!error && data) {
      setRankings(data);
    }
    
    setLoading(false);
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-[hsl(40_100%_55%)]" />;
      case 2:
        return <Medal className="w-6 h-6 text-[hsl(240_5%_65%)]" />;
      case 3:
        return <Award className="w-6 h-6 text-[hsl(25_100%_60%)]" />;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Trophy className="w-16 h-16 text-primary animate-pulse" />
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
              Rankings
            </h1>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="gaming-border relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 opacity-50" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Top 20 Vendedores
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3">
                  {rankings.map((user, index) => (
                    <Card 
                      key={user.id} 
                      className={`gaming-border-secondary hover-lift ${
                        user.id === profile?.id ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10">
                              {getMedalIcon(index + 1) || (
                                <span className="text-lg font-bold text-muted-foreground">
                                  #{index + 1}
                                </span>
                              )}
                            </div>
                            
                            <Avatar className="h-12 w-12 gaming-border">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                                {user.nome.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <p className="font-bold text-lg">
                                {user.nome}
                                {user.id === profile?.id && (
                                  <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                                    Você
                                  </Badge>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Nível {user.nivel_atual}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                              {user.pontos_total.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-sm text-muted-foreground">pontos</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
