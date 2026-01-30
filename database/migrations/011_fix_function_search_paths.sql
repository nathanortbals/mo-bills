-- Fix mutable search_path warnings on functions
-- Setting search_path prevents search_path attacks while allowing table/extension access

-- Functions using extensions (vector, pg_trgm) need 'extensions' schema
ALTER FUNCTION public.match_bill_embeddings SET search_path TO public, extensions;
ALTER FUNCTION public.match_bill_embeddings_filtered SET search_path TO public, extensions;
ALTER FUNCTION public.search_legislators_fuzzy SET search_path TO public, extensions;

-- Other functions just need 'public'
ALTER FUNCTION public.update_updated_at_column SET search_path TO public;
ALTER FUNCTION public.populate_bill_document_id SET search_path TO public;
