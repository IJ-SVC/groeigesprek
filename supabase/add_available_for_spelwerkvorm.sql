-- Add available_for_spelwerkvorm column to colleagues table
-- Colleagues with this flag can be selected for "Plan zelf een afspraak" (spelwerkvorm individual request)
ALTER TABLE colleagues_groeigesprek
  ADD COLUMN IF NOT EXISTS available_for_spelwerkvorm BOOLEAN DEFAULT false;
