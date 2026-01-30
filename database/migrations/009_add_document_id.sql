-- Update bill_documents table schema:
-- 1. Add document_id: Identifier from Missouri House website (e.g., "2918H.01I", "HB1366I")
-- 2. Add document_title: Title like "Introduced", "Perfected", "Committee", "Truly Agreed"
-- 3. Make document_url, extracted_text, document_id, document_title required
-- 4. Drop unused storage_path and text_extracted_at columns

-- Add new columns
ALTER TABLE bill_documents
ADD COLUMN document_id TEXT;

ALTER TABLE bill_documents
ADD COLUMN document_title TEXT;

-- Make fields required (run after truncating table or backfilling data)
ALTER TABLE bill_documents
ALTER COLUMN document_url SET NOT NULL,
ALTER COLUMN extracted_text SET NOT NULL,
ALTER COLUMN document_id SET NOT NULL,
ALTER COLUMN document_title SET NOT NULL;

-- Drop unused columns
ALTER TABLE bill_documents
DROP COLUMN storage_path,
DROP COLUMN text_extracted_at;

-- Create index for faster lookups by document_id
CREATE INDEX idx_bill_documents_document_id ON bill_documents(document_id);

-- Add comments explaining the columns
COMMENT ON COLUMN bill_documents.document_id IS 'Document identifier from Missouri House website (e.g., 2918H.01I for bill text, HB1366I for summary)';
COMMENT ON COLUMN bill_documents.document_title IS 'Document title from website (e.g., Introduced, Perfected, Committee, Truly Agreed)';
