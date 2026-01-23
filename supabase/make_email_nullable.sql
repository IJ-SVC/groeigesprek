-- Make email nullable for registrations
-- This allows individual conversation requests without email

ALTER TABLE registrations_groeigesprek 
  ALTER COLUMN email DROP NOT NULL;

-- Update unique constraint to handle NULL emails
-- Drop the old unique index
DROP INDEX IF EXISTS idx_registrations_unique_active;

-- Create new unique index that allows NULL emails
-- For non-NULL emails: same email can't register twice for same session
-- For NULL emails: multiple NULL emails are allowed (PostgreSQL treats NULL as distinct)
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_unique_active 
ON registrations_groeigesprek(session_id, email) 
WHERE status = 'active' AND email IS NOT NULL;

