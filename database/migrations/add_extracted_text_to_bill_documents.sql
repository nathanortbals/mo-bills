-- Add extracted_text column to bill_documents table
-- This will store the full text extracted from PDFs with line numbers preserved

ALTER TABLE bill_documents
ADD COLUMN IF NOT EXISTS extracted_text TEXT;

ALTER TABLE bill_documents
ADD COLUMN IF NOT EXISTS text_extracted_at TIMESTAMPTZ;

COMMENT ON COLUMN bill_documents.extracted_text IS 'Full text extracted from PDF with line numbers preserved';
COMMENT ON COLUMN bill_documents.text_extracted_at IS 'Timestamp when text was extracted from PDF';

-- Create index on text_extracted_at for filtering documents that need extraction
CREATE INDEX IF NOT EXISTS bill_documents_text_extracted_at_idx
ON bill_documents(text_extracted_at)
WHERE text_extracted_at IS NOT NULL;
