-- Fix all remaining policies that cause infinite recursion

-- Drop and recreate policies for empresas
DROP POLICY IF EXISTS "Masters can manage empresas" ON empresas;
CREATE POLICY "Masters can manage empresas"
ON empresas
FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'MASTER');

-- Drop and recreate policies for equipes
DROP POLICY IF EXISTS "Masters and Gestores can manage equipes" ON equipes;
CREATE POLICY "Masters and Gestores can manage equipes"
ON equipes
FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) IN ('MASTER', 'GESTOR'));

-- Drop and recreate policies for produtos
DROP POLICY IF EXISTS "Masters can manage produtos" ON produtos;
CREATE POLICY "Masters can manage produtos"
ON produtos
FOR ALL
TO authenticated
USING (public.get_user_role(auth.uid()) = 'MASTER');

-- Drop and recreate policies for solicitacoes_cadastro
DROP POLICY IF EXISTS "Masters can view all requests" ON solicitacoes_cadastro;
DROP POLICY IF EXISTS "Masters can update requests" ON solicitacoes_cadastro;

CREATE POLICY "Masters can view all requests"
ON solicitacoes_cadastro
FOR SELECT
TO authenticated
USING (public.get_user_role(auth.uid()) = 'MASTER' OR auth.uid() = usuario_id);

CREATE POLICY "Masters can update requests"
ON solicitacoes_cadastro
FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'MASTER')
WITH CHECK (public.get_user_role(auth.uid()) = 'MASTER');