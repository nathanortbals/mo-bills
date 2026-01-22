-- Drop the custom filtered RPC function
-- We now use SupabaseVectorStore's filter parameter instead

DROP FUNCTION IF EXISTS match_bill_embeddings_filtered(
    vector(1536),
    integer,
    float,
    integer,
    text,
    text,
    text
);

COMMENT ON FUNCTION match_bill_embeddings IS
'Similarity search function for finding semantically similar bill text chunks.
Use SupabaseVectorStore with filter functions for metadata filtering instead of match_bill_embeddings_filtered.';
