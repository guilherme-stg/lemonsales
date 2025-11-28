import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AguardandoAprovacao from "./pages/AguardandoAprovacao";
import Solicitacoes from "./pages/Solicitacoes";
import Rankings from "./pages/Rankings";
import RegistrarVenda from "./pages/RegistrarVenda";
import Conquistas from "./pages/Conquistas";
import Metas from "./pages/Metas";
import RegistrarUsuario from "./pages/RegistrarUsuario";
import AlterarSenha from "./pages/AlterarSenha";
import GerenciarMetas from "./pages/GerenciarMetas";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/aguardando-aprovacao" element={<AguardandoAprovacao />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/registrar-venda" element={<RegistrarVenda />} />
              <Route path="/conquistas" element={<Conquistas />} />
              <Route path="/metas" element={<Metas />} />
              <Route path="/registrar-usuario" element={<RegistrarUsuario />} />
              <Route path="/alterar-senha" element={<AlterarSenha />} />
              <Route path="/solicitacoes" element={<Solicitacoes />} />
              <Route path="/gerenciar-metas" element={<GerenciarMetas />} />
              <Route path="/perfil" element={<Perfil />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
