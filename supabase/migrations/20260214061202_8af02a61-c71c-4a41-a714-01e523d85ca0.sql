
-- Fix the overly permissive INSERT policy on profiles
DROP POLICY "System can insert profiles" ON public.profiles;
CREATE POLICY "System can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
