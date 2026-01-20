-- Add embedding tracking fields to bills table
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS embeddings_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS embeddings_generated_at TIMESTAMPTZ;

-- Create index for querying bills by embeddings status
CREATE INDEX IF NOT EXISTS bills_embeddings_generated_idx
ON bills (embeddings_generated);

-- Add comments for documentation
COMMENT ON COLUMN bills.embeddings_generated IS 'Whether vector embeddings have been generated for this bill';
COMMENT ON COLUMN bills.embeddings_generated_at IS 'Timestamp when embeddings were last generated for this bill';
