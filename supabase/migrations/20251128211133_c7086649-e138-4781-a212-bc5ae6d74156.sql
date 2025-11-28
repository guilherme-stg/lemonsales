-- Create table for team goals/metas
CREATE TABLE IF NOT EXISTS public.metas_equipe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo VARCHAR(20) NOT NULL CHECK (periodo IN ('SEMANAL', 'MENSAL', 'TRIMESTRAL')),
  valor_meta_time NUMERIC NOT NULL CHECK (valor_meta_time > 0),
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  ativa BOOLEAN DEFAULT true,
  criado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for goal bonuses/bonificacoes
CREATE TABLE IF NOT EXISTS public.bonificacoes_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_id UUID NOT NULL REFERENCES metas_equipe(id) ON DELETE CASCADE,
  percentual_meta INTEGER NOT NULL CHECK (percentual_meta IN (33, 66, 100)),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.metas_equipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonificacoes_meta ENABLE ROW LEVEL SECURITY;

-- RLS Policies for metas_equipe
CREATE POLICY "Everyone can view active metas"
  ON public.metas_equipe
  FOR SELECT
  USING (ativa = true);

CREATE POLICY "Masters and Gestores can manage metas"
  ON public.metas_equipe
  FOR ALL
  USING (has_role(auth.uid(), 'MASTER') OR has_role(auth.uid(), 'GESTOR'))
  WITH CHECK (has_role(auth.uid(), 'MASTER') OR has_role(auth.uid(), 'GESTOR'));

-- RLS Policies for bonificacoes_meta
CREATE POLICY "Everyone can view bonificacoes"
  ON public.bonificacoes_meta
  FOR SELECT
  USING (true);

CREATE POLICY "Masters and Gestores can manage bonificacoes"
  ON public.bonificacoes_meta
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM metas_equipe 
      WHERE metas_equipe.id = bonificacoes_meta.meta_id
      AND (has_role(auth.uid(), 'MASTER') OR has_role(auth.uid(), 'GESTOR'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM metas_equipe 
      WHERE metas_equipe.id = bonificacoes_meta.meta_id
      AND (has_role(auth.uid(), 'MASTER') OR has_role(auth.uid(), 'GESTOR'))
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_metas_equipe_updated_at
  BEFORE UPDATE ON public.metas_equipe
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE metas_equipe;
ALTER PUBLICATION supabase_realtime ADD TABLE bonificacoes_meta;