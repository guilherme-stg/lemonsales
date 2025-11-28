-- Fix security warnings

-- Add missing RLS policies for empresas
CREATE POLICY "Everyone can view empresas" ON empresas FOR SELECT USING (true);
CREATE POLICY "Masters can manage empresas" ON empresas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND papel = 'MASTER')
);

-- Add missing RLS policies for equipes
CREATE POLICY "Everyone can view equipes" ON equipes FOR SELECT USING (true);
CREATE POLICY "Masters and Gestores can manage equipes" ON equipes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND papel IN ('MASTER', 'GESTOR'))
);

-- Add missing RLS policies for produtos
CREATE POLICY "Everyone can view produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Masters can manage produtos" ON produtos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND papel = 'MASTER')
);

-- Add missing RLS policies for eventos_nivel
CREATE POLICY "Users can view own level events" ON eventos_nivel FOR SELECT USING (auth.uid() = usuario_id);

-- Fix function search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;