-- Add filtered semantic search function for bill embeddings
-- Supports filtering by session, sponsor, and committee metadata

CREATE OR REPLACE FUNCTION match_bill_embeddings_filtered(
    query_embedding vector(1536),
    match_count integer DEFAULT 10,
    match_threshold float DEFAULT 0.3,
    filter_session_year integer DEFAULT NULL,
    filter_session_code text DEFAULT NULL,
    filter_sponsor_name text DEFAULT NULL,
    filter_committee_name text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    content text,
    metadata jsonb,
    embedding vector(1536),
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        bill_embeddings.id,
        bill_embeddings.content,
        bill_embeddings.metadata,
        bill_embeddings.embedding,
        1 - (bill_embeddings.embedding <=> query_embedding) AS similarity
    FROM bill_embeddings
    WHERE
        1 - (bill_embeddings.embedding <=> query_embedding) > match_threshold
        AND (filter_session_year IS NULL OR (bill_embeddings.metadata->>'session_year')::integer = filter_session_year)
        AND (filter_session_code IS NULL OR bill_embeddings.metadata->>'session_code' = filter_session_code)
        AND (filter_sponsor_name IS NULL OR bill_embeddings.metadata->>'primary_sponsor_name' ILIKE '%' || filter_sponsor_name || '%')
        AND (filter_committee_name IS NULL OR bill_embeddings.metadata->'committee_names' ? filter_committee_name)
    ORDER BY bill_embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Grant execute permissions to authenticated and service roles
GRANT EXECUTE ON FUNCTION match_bill_embeddings_filtered TO authenticated, service_role, anon;

COMMENT ON FUNCTION match_bill_embeddings_filtered IS
'Enhanced vector similarity search for bill embeddings with metadata filtering.
Supports filtering by session year, session code, primary sponsor name, and committee name.';
