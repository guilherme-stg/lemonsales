import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogOut } from 'lucide-react';

export default function AguardandoAprovacao() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/20 via-background to-background" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md gaming-border relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-accent gaming-border">
              <Clock className="w-12 h-12 text-background" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Cadastro em Análise
          </CardTitle>
          <CardDescription className="text-base">
            Seu cadastro foi recebido e está aguardando aprovação do administrador
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <p className="text-sm text-muted-foreground">
              ⏳ <strong>O que acontece agora?</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              O administrador do sistema irá revisar seu cadastro. Você receberá acesso assim que for aprovado.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 gaming-border space-y-2">
            <p className="text-sm font-medium">💡 Dica</p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com o administrador da sua equipe para acelerar o processo de aprovação.
            </p>
          </div>

          <Button
            onClick={signOut}
            variant="outline"
            className="w-full gaming-border"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
