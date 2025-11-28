import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Zap, Trophy, Target, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="text-center space-y-8 max-w-4xl relative z-10">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8 animate-float">
          <div className="p-6 rounded-full bg-gradient-primary gaming-border shadow-glow-primary">
            <Zap className="w-20 h-20 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-holographic bg-clip-text text-transparent animate-slide-up">
            GameSales
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Transforme suas vendas em pontos, XP e conquistas épicas
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="gaming-border rounded-lg p-6 bg-card/50 hover-lift">
            <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Sistema de Níveis</h3>
            <p className="text-sm text-muted-foreground">Evolua com cada venda e desbloqueie conquistas</p>
          </div>
          <div className="gaming-border-secondary rounded-lg p-6 bg-card/50 hover-lift">
            <Target className="w-12 h-12 text-secondary mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Missões Diárias</h3>
            <p className="text-sm text-muted-foreground">Complete desafios e ganhe pontos extras</p>
          </div>
          <div className="gaming-border-accent rounded-lg p-6 bg-card/50 hover-lift">
            <TrendingUp className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Rankings</h3>
            <p className="text-sm text-muted-foreground">Compete com sua equipe e seja o melhor</p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-8">
          <Button
            onClick={() => navigate('/auth')}
            size="lg"
            className="text-xl px-12 py-6 bg-gradient-primary hover:opacity-90 gaming-border shadow-glow-primary font-bold"
          >
            Começar a Jogar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
