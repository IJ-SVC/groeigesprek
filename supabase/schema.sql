-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversation Types table
CREATE TABLE IF NOT EXISTS conversation_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default conversation types
INSERT INTO conversation_types (name, description) VALUES
  ('groepsontwikkelgesprek', 'Groepsontwikkelgesprek'),
  ('inloopgesprek', 'Inloopgesprek'),
  ('individueel gesprek', 'Individueel gesprek')
ON CONFLICT (name) DO NOTHING;

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions_groeigesprek (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_type_id UUID NOT NULL REFERENCES conversation_types(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  teams_link TEXT,
  facilitator TEXT NOT NULL,
  facilitator_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled')),
  cancellation_reason TEXT,
  target_audience TEXT,
  notes TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_groeigesprek_date ON sessions_groeigesprek(date);
CREATE INDEX IF NOT EXISTS idx_sessions_groeigesprek_type ON sessions_groeigesprek(conversation_type_id);
CREATE INDEX IF NOT EXISTS idx_sessions_groeigesprek_status ON sessions_groeigesprek(status);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations_groeigesprek (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions_groeigesprek(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'no_show')),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for registrations
CREATE INDEX IF NOT EXISTS idx_registrations_groeigesprek_session_id ON registrations_groeigesprek(session_id);
CREATE INDEX IF NOT EXISTS idx_registrations_groeigesprek_email ON registrations_groeigesprek(email);
CREATE INDEX IF NOT EXISTS idx_registrations_groeigesprek_status ON registrations_groeigesprek(status);

-- Unique constraint: same email can't register twice for same session when active
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_unique_active 
ON registrations_groeigesprek(session_id, email) 
WHERE status = 'active';

-- Headers table
CREATE TABLE IF NOT EXISTS headers_groeigesprek (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for headers
CREATE INDEX IF NOT EXISTS idx_headers_groeigesprek_is_active ON headers_groeigesprek(is_active);

-- Settings table
CREATE TABLE IF NOT EXISTS settings_groeigesprek (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings_groeigesprek (key, value) VALUES
  ('cancellation_cutoff_hours', '2'),
  ('email_confirmation_enabled', 'false'),
  ('email_cancellation_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_sessions_groeigesprek_updated_at ON sessions_groeigesprek;
DROP TRIGGER IF EXISTS update_headers_groeigesprek_updated_at ON headers_groeigesprek;
DROP TRIGGER IF EXISTS update_settings_groeigesprek_updated_at ON settings_groeigesprek;

-- Create triggers
CREATE TRIGGER update_sessions_groeigesprek_updated_at 
  BEFORE UPDATE ON sessions_groeigesprek 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_headers_groeigesprek_updated_at 
  BEFORE UPDATE ON headers_groeigesprek 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_groeigesprek_updated_at 
  BEFORE UPDATE ON settings_groeigesprek 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE conversation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions_groeigesprek ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations_groeigesprek ENABLE ROW LEVEL SECURITY;
ALTER TABLE headers_groeigesprek ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings_groeigesprek ENABLE ROW LEVEL SECURITY;

-- Conversation Types: Public read, Admin write
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Conversation types are viewable by everyone" ON conversation_types;
DROP POLICY IF EXISTS "Conversation types are insertable by admins" ON conversation_types;

CREATE POLICY "Conversation types are viewable by everyone"
  ON conversation_types FOR SELECT
  USING (true);

CREATE POLICY "Conversation types are insertable by admins"
  ON conversation_types FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

-- Sessions: Public can view published sessions, Admin full access
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Published sessions are viewable by everyone" ON sessions_groeigesprek;
DROP POLICY IF EXISTS "Admins can view all sessions" ON sessions_groeigesprek;
DROP POLICY IF EXISTS "Admins can insert sessions" ON sessions_groeigesprek;
DROP POLICY IF EXISTS "Admins can update sessions" ON sessions_groeigesprek;
DROP POLICY IF EXISTS "Admins can delete sessions" ON sessions_groeigesprek;

CREATE POLICY "Published sessions are viewable by everyone"
  ON sessions_groeigesprek FOR SELECT
  USING (status = 'published' AND date >= CURRENT_DATE);

CREATE POLICY "Admins can view all sessions"
  ON sessions_groeigesprek FOR SELECT
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

CREATE POLICY "Admins can insert sessions"
  ON sessions_groeigesprek FOR INSERT
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

CREATE POLICY "Authenticated users can insert individual conversation sessions"
  ON sessions_groeigesprek FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND conversation_type_id IN (
      SELECT id FROM conversation_types WHERE name = 'individueel gesprek'
    )
  );

CREATE POLICY "Admins can update sessions"
  ON sessions_groeigesprek FOR UPDATE
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

CREATE POLICY "Admins can delete sessions"
  ON sessions_groeigesprek FOR DELETE
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

-- Registrations: Public can insert, view own (via token), Admin full access
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can register" ON registrations_groeigesprek;
DROP POLICY IF EXISTS "Admins can view all registrations" ON registrations_groeigesprek;
DROP POLICY IF EXISTS "Admins can delete registrations" ON registrations_groeigesprek;
DROP POLICY IF EXISTS "Admins can update registrations" ON registrations_groeigesprek;

CREATE POLICY "Anyone can register"
  ON registrations_groeigesprek FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all registrations"
  ON registrations_groeigesprek FOR SELECT
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

CREATE POLICY "Admins can delete registrations"
  ON registrations_groeigesprek FOR DELETE
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

CREATE POLICY "Admins can update registrations"
  ON registrations_groeigesprek FOR UPDATE
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

-- Headers: Public can view active, Admin full access
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Active headers are viewable by everyone" ON headers_groeigesprek;
DROP POLICY IF EXISTS "Admins can view all headers" ON headers_groeigesprek;
DROP POLICY IF EXISTS "Admins can manage headers" ON headers_groeigesprek;

CREATE POLICY "Active headers are viewable by everyone"
  ON headers_groeigesprek FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all headers"
  ON headers_groeigesprek FOR SELECT
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

CREATE POLICY "Admins can manage headers"
  ON headers_groeigesprek FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

-- Settings: Public can view, Admin full access
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings_groeigesprek;
DROP POLICY IF EXISTS "Admins can manage settings" ON settings_groeigesprek;

CREATE POLICY "Settings are viewable by everyone"
  ON settings_groeigesprek FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON settings_groeigesprek FOR ALL
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb->>'role' = 'admin'
    OR (auth.jwt() ->> 'user_metadata')::jsonb->>'is_admin' = 'true'
  );

-- Colleagues table for individual conversation requests
CREATE TABLE IF NOT EXISTS colleagues_groeigesprek (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for colleagues
CREATE INDEX IF NOT EXISTS idx_colleagues_groeigesprek_email ON colleagues_groeigesprek(email);
CREATE INDEX IF NOT EXISTS idx_colleagues_groeigesprek_is_active ON colleagues_groeigesprek(is_active);

-- Individual requests table
CREATE TABLE IF NOT EXISTS individual_requests_groeigesprek (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colleague_id UUID NOT NULL REFERENCES colleagues_groeigesprek(id) ON DELETE CASCADE,
  requester_email TEXT,
  requester_name TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for individual requests
CREATE INDEX IF NOT EXISTS idx_individual_requests_groeigesprek_colleague_id ON individual_requests_groeigesprek(colleague_id);
CREATE INDEX IF NOT EXISTS idx_individual_requests_groeigesprek_status ON individual_requests_groeigesprek(status);
CREATE INDEX IF NOT EXISTS idx_individual_requests_groeigesprek_created_at ON individual_requests_groeigesprek(created_at);

-- Trigger for colleagues updated_at
DROP TRIGGER IF EXISTS update_colleagues_groeigesprek_updated_at ON colleagues_groeigesprek;

CREATE TRIGGER update_colleagues_groeigesprek_updated_at 
  BEFORE UPDATE ON colleagues_groeigesprek 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE colleagues_groeigesprek ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_requests_groeigesprek ENABLE ROW LEVEL SECURITY;

-- Colleagues: Public can view active, Authenticated users can manage
DROP POLICY IF EXISTS "Active colleagues are viewable by everyone" ON colleagues_groeigesprek;
DROP POLICY IF EXISTS "Authenticated users can view all colleagues" ON colleagues_groeigesprek;
DROP POLICY IF EXISTS "Authenticated users can manage colleagues" ON colleagues_groeigesprek;

CREATE POLICY "Active colleagues are viewable by everyone"
  ON colleagues_groeigesprek FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all colleagues"
  ON colleagues_groeigesprek FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage colleagues"
  ON colleagues_groeigesprek FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Individual requests: Anyone can insert, Authenticated users can view/manage
DROP POLICY IF EXISTS "Anyone can create individual requests" ON individual_requests_groeigesprek;
DROP POLICY IF EXISTS "Admins can view all individual requests" ON individual_requests_groeigesprek;
DROP POLICY IF EXISTS "Admins can manage individual requests" ON individual_requests_groeigesprek;
DROP POLICY IF EXISTS "Authenticated users can view individual requests" ON individual_requests_groeigesprek;
DROP POLICY IF EXISTS "Authenticated users can manage individual requests" ON individual_requests_groeigesprek;
DROP POLICY IF EXISTS "Authenticated users can delete individual requests" ON individual_requests_groeigesprek;

CREATE POLICY "Anyone can create individual requests"
  ON individual_requests_groeigesprek FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view individual requests"
  ON individual_requests_groeigesprek FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage individual requests"
  ON individual_requests_groeigesprek FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete individual requests"
  ON individual_requests_groeigesprek FOR DELETE
  USING (auth.role() = 'authenticated');


