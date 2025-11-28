-- Create enum for roles (if not exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('MASTER', 'GESTOR', 'VENDEDOR');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for secure role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, papel::text::app_role
FROM public.profiles
WHERE papel IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Create secure function to check roles (bypasses RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- Drop ALL existing problematic policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their team" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Masters can update all profiles" ON profiles;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Masters can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'MASTER'));

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Masters can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'MASTER'))
WITH CHECK (public.has_role(auth.uid(), 'MASTER'));

-- Update other table policies to use has_role
DROP POLICY IF EXISTS "Masters can manage empresas" ON empresas;
CREATE POLICY "Masters can manage empresas"
ON empresas FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'MASTER'));

DROP POLICY IF EXISTS "Masters and Gestores can manage equipes" ON equipes;
CREATE POLICY "Masters and Gestores can manage equipes"
ON equipes FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'MASTER') OR public.has_role(auth.uid(), 'GESTOR'));

DROP POLICY IF EXISTS "Masters can manage produtos" ON produtos;
CREATE POLICY "Masters can manage produtos"
ON produtos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'MASTER'));

DROP POLICY IF EXISTS "Masters can view all requests" ON solicitacoes_cadastro;
DROP POLICY IF EXISTS "Masters can update requests" ON solicitacoes_cadastro;

CREATE POLICY "Masters can view all requests"
ON solicitacoes_cadastro FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'MASTER') OR auth.uid() = usuario_id);

CREATE POLICY "Masters can update requests"
ON solicitacoes_cadastro FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'MASTER'))
WITH CHECK (public.has_role(auth.uid(), 'MASTER'));

-- Create trigger to keep user_roles in sync with profiles.papel
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete old role if changed
  IF TG_OP = 'UPDATE' AND OLD.papel IS DISTINCT FROM NEW.papel THEN
    DELETE FROM public.user_roles WHERE user_id = NEW.id;
  END IF;
  
  -- Insert new role
  IF NEW.papel IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, NEW.papel::text::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_user_role_trigger
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role();