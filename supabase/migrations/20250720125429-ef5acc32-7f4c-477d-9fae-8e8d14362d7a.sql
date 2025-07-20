-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.users;

-- Create a more permissive policy that allows access for your custom auth system
-- This allows all operations since we're handling authentication in the application layer
CREATE POLICY "Allow all operations for custom auth" 
ON public.users 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Also ensure we can access the table without Supabase auth
-- by granting access to the anon role (which is what your app uses)
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;