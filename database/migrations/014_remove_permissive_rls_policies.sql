-- Remove permissive "Allow all" policies to make tables service-role only
-- RLS is already enabled, so dropping policies makes them private

DROP POLICY IF EXISTS "Allow all on bill_actions" ON public.bill_actions;
DROP POLICY IF EXISTS "Allow all on bill_documents" ON public.bill_documents;
DROP POLICY IF EXISTS "Allow all on bill_hearings" ON public.bill_hearings;
DROP POLICY IF EXISTS "Allow all on bill_sponsors" ON public.bill_sponsors;
DROP POLICY IF EXISTS "Allow all on bills" ON public.bills;
