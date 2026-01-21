-- Update conversation type descriptions to match new naming
UPDATE conversation_types 
SET description = 'Ontwikkelgesprek in groepsvorm' 
WHERE name = 'groepsontwikkelgesprek';

UPDATE conversation_types 
SET description = 'Ontwikkelgesprek – spelwerkvorm (individueel)' 
WHERE name = 'inloopgesprek';

UPDATE conversation_types 
SET description = 'Individueel ontwikkelgesprek' 
WHERE name = 'individueel gesprek';

-- Re-apply RLS policies (the DROP statements in schema.sql will handle removing old ones)
-- Just run the CREATE POLICY statements from schema.sql starting from line 140

