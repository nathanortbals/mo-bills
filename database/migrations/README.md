# Database Migrations

## Running Migrations

Migrations should be run manually through the Supabase SQL Editor.

1. Log into your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Execute the SQL

## Available Migrations

### create_bill_embeddings.sql
Creates the bill_embeddings table and similarity search function for RAG.

**Status**: Should already be applied if you've generated embeddings.

### add_embeddings_tracking_to_bills.sql
Adds tracking fields to the bills table to record when embeddings were generated.

**Fields added:**
- `embeddings_generated` (BOOLEAN) - Whether embeddings exist for this bill
- `embeddings_generated_at` (TIMESTAMPTZ) - When embeddings were last generated

**To apply**: Copy and run the SQL in your Supabase dashboard SQL Editor.

### add_hearing_time_text.sql
Adds a text field for hearing times that can't be parsed as TIME.

**Status**: Should already be applied if you've scraped bills.
