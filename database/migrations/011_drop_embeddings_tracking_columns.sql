-- Drop embeddings tracking columns from bills table
-- These are no longer needed since bill_embeddings has a proper FK to bill_documents
-- We can query for embeddings existence via the bill_documents relationship

-- Drop the index first
DROP INDEX IF EXISTS bills_embeddings_generated_idx;

-- Drop the columns
ALTER TABLE bills
DROP COLUMN IF EXISTS embeddings_generated,
DROP COLUMN IF EXISTS embeddings_generated_at;
