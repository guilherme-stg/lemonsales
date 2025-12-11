-- Permitir que MASTER possa inserir vendas para qualquer vendedor
CREATE POLICY "Masters can insert sales for any user"
ON public.vendas
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.papel = 'MASTER'
  )
);