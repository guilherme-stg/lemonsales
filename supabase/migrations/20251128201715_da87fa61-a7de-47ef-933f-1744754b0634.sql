-- Add aprovado field to profiles
ALTER TABLE profiles ADD COLUMN aprovado BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN criado_por UUID REFERENCES profiles(id);

-- Update existing users to be approved
UPDATE profiles SET aprovado = true WHERE papel = 'MASTER';

-- Create table for tracking approval requests
CREATE TABLE solicitacoes_cadastro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADO', 'RECUSADO')),
  mensagem_recusa TEXT,
  avaliado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE solicitacoes_cadastro ENABLE ROW LEVEL SECURITY;

-- RLS policies for solicitacoes_cadastro
CREATE POLICY "Masters can view all requests" ON solicitacoes_cadastro 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND papel = 'MASTER')
  );

CREATE POLICY "Masters can update requests" ON solicitacoes_cadastro 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND papel = 'MASTER')
  );

CREATE POLICY "Users can view own request" ON solicitacoes_cadastro 
  FOR SELECT USING (auth.uid() = usuario_id);

-- Modify handle_new_user to check if created by Master and auto-approve
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_criador_papel user_role;
BEGIN
  -- Get the role of the creator if exists
  SELECT papel INTO v_criador_papel 
  FROM profiles 
  WHERE id = (NEW.raw_user_meta_data->>'criado_por')::uuid;
  
  -- Insert profile
  INSERT INTO public.profiles (
    id, 
    nome, 
    papel, 
    criado_por,
    aprovado
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data->>'papel')::user_role, 'VENDEDOR'),
    (NEW.raw_user_meta_data->>'criado_por')::uuid,
    -- Auto-approve if created by Master
    CASE 
      WHEN v_criador_papel = 'MASTER' THEN true 
      ELSE false 
    END
  );
  
  -- If not auto-approved, create solicitation request
  IF v_criador_papel IS NULL OR v_criador_papel != 'MASTER' THEN
    INSERT INTO public.solicitacoes_cadastro (usuario_id, status)
    VALUES (NEW.id, 'PENDENTE');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger for updated_at
CREATE TRIGGER update_solicitacoes_updated_at 
  BEFORE UPDATE ON solicitacoes_cadastro 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();