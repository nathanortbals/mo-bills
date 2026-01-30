-- Enable RLS on tables that should only be accessed from the backend
-- When RLS is enabled with no policies, only the service role can access the table

-- Bill embeddings (vector store)
ALTER TABLE bill_embeddings ENABLE ROW LEVEL SECURITY;

-- LangGraph checkpoint tables
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_blobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_writes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_migrations ENABLE ROW LEVEL SECURITY;

-- Add comments explaining the security model
COMMENT ON TABLE bill_embeddings IS 'Vector embeddings for bill documents. RLS enabled, no policies = service role only.';
COMMENT ON TABLE checkpoints IS 'LangGraph conversation checkpoints. RLS enabled, no policies = service role only.';
COMMENT ON TABLE checkpoint_blobs IS 'LangGraph checkpoint blob storage. RLS enabled, no policies = service role only.';
COMMENT ON TABLE checkpoint_writes IS 'LangGraph checkpoint write log. RLS enabled, no policies = service role only.';
COMMENT ON TABLE checkpoint_migrations IS 'LangGraph checkpoint migrations. RLS enabled, no policies = service role only.';
