-- Create HR Law chunks table
CREATE TABLE IF NOT EXISTS hr_law_chunks (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Citizen Law chunks table
CREATE TABLE IF NOT EXISTS citizen_law_chunks (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Company Law chunks table
CREATE TABLE IF NOT EXISTS company_law_chunks (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);