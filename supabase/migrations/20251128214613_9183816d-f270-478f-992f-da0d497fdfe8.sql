-- Allow Masters and Gestores to view all sales
CREATE POLICY "Masters and Gestores can view all sales"
ON vendas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.papel = 'MASTER' OR profiles.papel = 'GESTOR')
  )
);

-- Allow Masters and Gestores to update sales
CREATE POLICY "Masters and Gestores can update sales"
ON vendas
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.papel = 'MASTER' OR profiles.papel = 'GESTOR')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND (profiles.papel = 'MASTER' OR profiles.papel = 'GESTOR')
  )
);