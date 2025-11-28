-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Masters can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Masters can update all profiles" ON profiles;

-- Create a security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT papel FROM profiles WHERE id = user_id;
$$;

-- Create safe RLS policies using the function
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.get_user_role(auth.uid()) = 'MASTER');

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Masters can update all profiles"
ON profiles
FOR UPDATE
TO authenticated
USING (public.get_user_role(auth.uid()) = 'MASTER')
WITH CHECK (public.get_user_role(auth.uid()) = 'MASTER');

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);