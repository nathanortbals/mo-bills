-- Remove permissive "Allow all" policies to make tables service-role only

DROP POLICY IF EXISTS "Allow all on committees" ON public.committees;
DROP POLICY IF EXISTS "Allow all on legislators" ON public.legislators;
DROP POLICY IF EXISTS "Allow all on session_legislators" ON public.session_legislators;
DROP POLICY IF EXISTS "Allow all on sessions" ON public.sessions;
