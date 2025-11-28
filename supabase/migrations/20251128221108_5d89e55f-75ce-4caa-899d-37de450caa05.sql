-- Allow all authenticated users to view approved profiles for rankings
CREATE POLICY "Users can view all approved profiles for rankings"
ON profiles
FOR SELECT
TO authenticated
USING (aprovado = true);

-- Enable realtime for profiles table
ALTER TABLE profiles REPLICA IDENTITY FULL;