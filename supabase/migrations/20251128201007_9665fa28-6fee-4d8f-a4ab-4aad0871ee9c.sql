-- Create enum types
CREATE TYPE user_role AS ENUM ('MASTER', 'GESTOR', 'VENDEDOR');
CREATE TYPE sale_type AS ENUM ('NOVA', 'UPSELL', 'CROSS_SELL', 'RENOVACAO');
CREATE TYPE sale_status AS ENUM ('PENDENTE', 'APROVADA', 'REJEITADA');
CREATE TYPE rarity_type AS ENUM ('COMUM', 'RARO', 'EPICO', 'LENDARIO');
CREATE TYPE mission_type AS ENUM ('DIARIA_PADRAO', 'SEMANAL_PADRAO', 'MENSAL_PADRAO', 'ESPECIAL');
CREATE TYPE mission_criteria_type AS ENUM ('QUANTIDADE_VENDAS', 'VALOR_REAIS');
CREATE TYPE reward_redemption_status AS ENUM ('PENDENTE', 'ENTREGUE', 'CANCELADO');

-- Create empresas table
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  logo_url TEXT,
  nome_do_jogo TEXT DEFAULT 'Arena de Vendas',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create equipes table
CREATE TABLE equipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
  vendas_exigem_aprovacao BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  papel user_role NOT NULL DEFAULT 'VENDEDOR',
  equipe_id UUID REFERENCES equipes(id) ON DELETE SET NULL,
  xp_total INTEGER DEFAULT 0,
  pontos_total INTEGER DEFAULT 0,
  nivel_atual INTEGER DEFAULT 1,
  onboarding_concluido BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create produtos table
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  categoria TEXT,
  estrategico BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create vendas table
CREATE TABLE vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cliente TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  tipo_venda sale_type NOT NULL,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  data_venda TIMESTAMPTZ NOT NULL DEFAULT now(),
  status sale_status DEFAULT 'APROVADA',
  pontos_base INTEGER DEFAULT 0,
  pontos_bonus INTEGER DEFAULT 0,
  pontos_totais INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create conquistas table
CREATE TABLE conquistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  raridade rarity_type NOT NULL DEFAULT 'COMUM',
  icone TEXT,
  codigo_interno TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create conquistas_usuarios table
CREATE TABLE conquistas_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  conquista_id UUID REFERENCES conquistas(id) ON DELETE CASCADE NOT NULL,
  data_desbloqueio TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, conquista_id)
);

-- Create missoes table
CREATE TABLE missoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo mission_type NOT NULL,
  criterio_tipo mission_criteria_type,
  criterio_valor DECIMAL(10, 2),
  recompensa_pontos INTEGER DEFAULT 0,
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create missoes_usuarios table
CREATE TABLE missoes_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  missao_id UUID REFERENCES missoes(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  concluida BOOLEAN DEFAULT false,
  data_conclusao TIMESTAMPTZ,
  UNIQUE(missao_id, usuario_id)
);

-- Create recompensas table
CREATE TABLE recompensas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  custo_pontos INTEGER NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create resgates_recompensas table
CREATE TABLE resgates_recompensas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recompensa_id UUID REFERENCES recompensas(id) ON DELETE CASCADE NOT NULL,
  status reward_redemption_status DEFAULT 'PENDENTE',
  data_solicitacao TIMESTAMPTZ DEFAULT now(),
  data_atualizacao TIMESTAMPTZ DEFAULT now()
);

-- Create eventos_nivel table
CREATE TABLE eventos_nivel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nivel_alcancado INTEGER NOT NULL,
  data TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE conquistas_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE missoes_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE recompensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resgates_recompensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_nivel ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view profiles in their team" ON profiles FOR SELECT USING (
  equipe_id IN (SELECT equipe_id FROM profiles WHERE id = auth.uid())
);

-- RLS Policies for vendas
CREATE POLICY "Vendedores can create own sales" ON vendas FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Vendedores can view own sales" ON vendas FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Gestores can view team sales" ON vendas FOR SELECT USING (
  usuario_id IN (
    SELECT p.id FROM profiles p
    WHERE p.equipe_id IN (
      SELECT equipe_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- RLS Policies for conquistas (public read)
CREATE POLICY "Everyone can view conquistas" ON conquistas FOR SELECT USING (true);

-- RLS Policies for conquistas_usuarios
CREATE POLICY "Users can view own conquistas" ON conquistas_usuarios FOR SELECT USING (auth.uid() = usuario_id);

-- RLS Policies for missoes
CREATE POLICY "Users can view active missoes" ON missoes FOR SELECT USING (ativa = true);

-- RLS Policies for missoes_usuarios
CREATE POLICY "Users can view own missoes progress" ON missoes_usuarios FOR SELECT USING (auth.uid() = usuario_id);

-- RLS Policies for recompensas (public read if active)
CREATE POLICY "Everyone can view active recompensas" ON recompensas FOR SELECT USING (ativo = true);

-- RLS Policies for resgates_recompensas
CREATE POLICY "Users can view own redemptions" ON resgates_recompensas FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Users can create own redemptions" ON resgates_recompensas FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipes_updated_at BEFORE UPDATE ON equipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missoes_updated_at BEFORE UPDATE ON missoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recompensas_updated_at BEFORE UPDATE ON recompensas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resgates_updated_at BEFORE UPDATE ON resgates_recompensas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, papel)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data->>'papel')::user_role, 'VENDEDOR')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert seed data: conquistas padrão
INSERT INTO conquistas (nome, descricao, raridade, icone, codigo_interno) VALUES
('Bem-vindo ao Jogo', 'Complete o tutorial de boas-vindas', 'COMUM', 'trophy', 'BEM_VINDO'),
('Primeira Venda', 'Registre sua primeira venda', 'COMUM', 'dollar-sign', 'PRIMEIRA_VENDA'),
('Hat-trick de Vendas', 'Realize 3 vendas no mesmo dia', 'RARO', 'zap', 'HAT_TRICK'),
('Ticket Monstro', 'Feche uma venda de R$ 2.000 ou mais', 'EPICO', 'crown', 'TICKET_MONSTRO'),
('Maratonista', 'Venda por 5 dias consecutivos', 'RARO', 'flame', 'MARATONISTA'),
('Subiu de Nível', 'Alcance o nível 2', 'COMUM', 'arrow-up', 'SUBIU_NIVEL'),
('Closer', 'Alcance o nível 5', 'RARO', 'star', 'CLOSER'),
('Lendário', 'Alcance o nível 10', 'LENDARIO', 'sparkles', 'LENDARIO');

-- Insert seed data: empresa exemplo
INSERT INTO empresas (nome, nome_do_jogo) VALUES ('GameSales Corp', 'Arena de Vendas');

-- Insert seed data: equipes
INSERT INTO equipes (nome, empresa_id) 
SELECT 'Equipe Alpha', id FROM empresas LIMIT 1;

INSERT INTO equipes (nome, empresa_id) 
SELECT 'Equipe Beta', id FROM empresas LIMIT 1;

-- Insert seed data: produtos
INSERT INTO produtos (nome, categoria, estrategico) VALUES
('Produto Premium A', 'Premium', true),
('Produto Standard B', 'Standard', false),
('Produto Deluxe C', 'Premium', true),
('Serviço Básico D', 'Serviços', false),
('Pacote Enterprise E', 'Enterprise', true);