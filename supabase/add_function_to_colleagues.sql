-- Add function column to colleagues table
ALTER TABLE colleagues_groeigesprek 
  ADD COLUMN IF NOT EXISTS function TEXT;

