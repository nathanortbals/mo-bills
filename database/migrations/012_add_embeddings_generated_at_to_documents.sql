-- Add embeddings_generated_at column to bill_documents
-- This tracks when embeddings were generated for each document

ALTER TABLE bill_documents
ADD COLUMN embeddings_generated_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN bill_documents.embeddings_generated_at IS 'Timestamp when embeddings were generated for this document';
