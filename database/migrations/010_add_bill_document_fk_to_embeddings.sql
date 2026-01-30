-- Add bill_document_id foreign key to bill_embeddings
-- This links each embedding chunk back to its source document
-- A trigger auto-populates this from metadata during insert

-- Add the foreign key column
ALTER TABLE bill_embeddings
ADD COLUMN bill_document_id UUID NOT NULL REFERENCES bill_documents(id) ON DELETE CASCADE;

-- Create index for the foreign key
CREATE INDEX idx_bill_embeddings_bill_document_id ON bill_embeddings(bill_document_id);

-- Add comment
COMMENT ON COLUMN bill_embeddings.bill_document_id IS 'Foreign key to the source bill document';

-- Create trigger function to populate bill_document_id from metadata
CREATE OR REPLACE FUNCTION populate_bill_document_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Look up bill_document_id based on bill_id and document_title from metadata
  SELECT bd.id INTO NEW.bill_document_id
  FROM bill_documents bd
  WHERE bd.bill_id = (NEW.metadata->>'bill_id')::uuid
    AND bd.document_title = NEW.metadata->>'content_type'
  LIMIT 1;

  -- If not found, raise an error
  IF NEW.bill_document_id IS NULL THEN
    RAISE EXCEPTION 'Could not find bill_document for bill_id=% and content_type=%',
      NEW.metadata->>'bill_id', NEW.metadata->>'content_type';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trg_populate_bill_document_id
  BEFORE INSERT ON bill_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION populate_bill_document_id();
