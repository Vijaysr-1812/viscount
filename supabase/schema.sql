-- Enable extensions in Database -> Extensions:
CREATE EXTENSION IF NOT EXISTS "vector"; -- (pgvector)
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- (full-text search)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- (UUID generation)

-- ============================================
-- USERS & ORGANIZATIONS
-- ============================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  UNIQUE(org_id, user_id)
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  default_org_id UUID REFERENCES organizations(id),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================
-- CONTRACTS
-- ============================================
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  contract_type TEXT, -- 'supply', 'service', 'NDA', etc.
  parties JSONB DEFAULT '[]', -- [{name, role, contact}]
  effective_date DATE,
  expiry_date DATE,
  contract_value DECIMAL,
  currency TEXT DEFAULT 'USD',
  
  -- File info
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_hash TEXT, -- SHA-256 for dedup
  page_count INT,
  
  -- Processing state
  status TEXT CHECK (status IN ('uploading','queued','parsing','extracting','ready','failed')) DEFAULT 'uploading',
  processing_error TEXT,
  parsed_text TEXT, -- full extracted text
  
  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contracts_org ON contracts(org_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_text_search ON contracts USING gin(to_tsvector('english', parsed_text));

-- ============================================
-- OBLIGATIONS (Extracted from contracts)
-- ============================================
CREATE TABLE obligations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Obligation details
  clause_reference TEXT, -- "Section 3.2"
  clause_text TEXT NOT NULL, -- exact contract excerpt
  obligation_summary TEXT NOT NULL, -- AI-generated plain English
  
  -- Who/what/when
  responsible_party TEXT,
  obligation_type TEXT, -- 'delivery', 'payment', 'quality', 'reporting', 'temperature', 'quantity'
  deliverable TEXT,
  quantity_value DECIMAL,
  quantity_unit TEXT,
  conditions JSONB DEFAULT '[]', -- ["temp < 4C", "packed in styrofoam"]
  
  -- Timing
  due_date TIMESTAMPTZ,
  recurrence TEXT, -- 'one-time', 'weekly', 'monthly'
  
  -- Status
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('pending', 'evidence_submitted', 'verified', 'partially_met', 'breached', 'disputed', 'waived')) DEFAULT 'pending',
  confidence_score DECIMAL(3,2), -- AI's confidence in extraction (0-1)
  
  -- AI extraction metadata
  extracted_by_model TEXT,
  human_verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_obligations_contract ON obligations(contract_id);
CREATE INDEX idx_obligations_due ON obligations(due_date) WHERE status = 'pending';
CREATE INDEX idx_obligations_status ON obligations(status);

-- ============================================
-- EVIDENCE (Multimodal proof)
-- ============================================
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL, -- optional link
  
  -- File info
  evidence_type TEXT CHECK (evidence_type IN ('pdf', 'image', 'audio', 'video', 'email', 'log', 'spreadsheet', 'text')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  file_hash TEXT,
  
  -- Extracted content
  extracted_text TEXT, -- OCR/transcription/parsed content
  ai_summary TEXT, -- Gemini-generated description
  ai_analysis JSONB DEFAULT '{}', -- {entities, dates, quantities, locations}
  
  -- Source metadata
  captured_at TIMESTAMPTZ, -- when the event happened (EXIF, email date, log timestamp)
  source TEXT, -- 'manual_upload', 'email_forward', 'api_webhook'
  source_metadata JSONB DEFAULT '{}', -- EXIF, email headers, etc.
  
  -- Processing
  status TEXT CHECK (status IN ('uploading','queued','processing','ready','failed')) DEFAULT 'uploading',
  processing_error TEXT,
  
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_evidence_org ON evidence(org_id);
CREATE INDEX idx_evidence_contract ON evidence(contract_id);
CREATE INDEX idx_evidence_captured ON evidence(captured_at);

-- ============================================
-- OBLIGATION-EVIDENCE LINKS (The Magic Layer)
-- ============================================
CREATE TABLE obligation_evidence_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  obligation_id UUID REFERENCES obligations(id) ON DELETE CASCADE,
  evidence_id UUID REFERENCES evidence(id) ON DELETE CASCADE,
  
  -- AI matching results
  match_type TEXT CHECK (match_type IN ('full', 'partial', 'contradicts', 'unrelated')),
  confidence_score DECIMAL(3,2), -- 0-1
  ai_reasoning TEXT, -- why this evidence matches
  gaps JSONB DEFAULT '[]', -- what's missing
  
  -- Human review
  human_verified BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(obligation_id, evidence_id)
);

CREATE INDEX idx_links_obligation ON obligation_evidence_links(obligation_id);
CREATE INDEX idx_links_evidence ON obligation_evidence_links(evidence_id);

-- ============================================
-- VECTOR EMBEDDINGS (Semantic Search)
-- ============================================
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  source_type TEXT CHECK (source_type IN ('contract', 'evidence', 'obligation')),
  source_id UUID NOT NULL,
  
  chunk_index INT,
  chunk_text TEXT NOT NULL,
  embedding vector(384), -- BGE-small dimensions
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chunks_embedding ON document_chunks 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_chunks_source ON document_chunks(source_type, source_id);

-- ============================================
-- COMPLIANCE TIMELINE
-- ============================================
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  obligation_id UUID REFERENCES obligations(id) ON DELETE SET NULL,
  evidence_id UUID REFERENCES evidence(id) ON DELETE SET NULL,
  
  event_type TEXT NOT NULL, -- 'contract_uploaded', 'obligation_extracted', 'evidence_uploaded', 'match_found', 'deadline_passed', 'dispute_raised', 'verified'
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical', 'success')),
  
  actor_id UUID REFERENCES auth.users(id),
  actor_type TEXT, -- 'user', 'system', 'ai'
  
  payload JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_contract ON timeline_events(contract_id, occurred_at DESC);
CREATE INDEX idx_timeline_org ON timeline_events(org_id, occurred_at DESC);

-- ============================================
-- RISK SCORES
-- ============================================
CREATE TABLE risk_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  overall_score INT CHECK (overall_score BETWEEN 0 AND 100),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Breakdown
  missing_evidence_score INT,
  overdue_score INT,
  low_confidence_score INT,
  dispute_score INT,
  
  factors JSONB DEFAULT '[]', -- [{factor, weight, contribution}]
  recommendations JSONB DEFAULT '[]',
  
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risk_contract ON risk_scores(contract_id, calculated_at DESC);

-- ============================================
-- AUDIT REPORTS
-- ============================================
CREATE TABLE audit_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  
  report_type TEXT, -- 'full_audit', 'compliance_summary', 'dispute_package'
  title TEXT,
  
  config JSONB DEFAULT '{}', -- generation settings
  content JSONB DEFAULT '{}', -- structured report
  pdf_url TEXT,
  
  shareable_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BACKGROUND JOB TRACKING
-- ============================================
CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- 'parse_contract', 'extract_obligations', 'process_evidence', 'match_evidence', 'generate_report'
  resource_id UUID NOT NULL,
  resource_type TEXT NOT NULL,
  
  status TEXT CHECK (status IN ('queued', 'running', 'completed', 'failed', 'retrying')) DEFAULT 'queued',
  progress INT DEFAULT 0,
  current_stage TEXT,
  
  inngest_run_id TEXT,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON processing_jobs(status, created_at);


-- ============================================
-- RLS & SECURITY
-- ============================================
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE obligation_evidence_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;

-- Helper function: is user a member of org?
CREATE OR REPLACE FUNCTION is_org_member(org_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members 
    WHERE org_id = org_uuid AND user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Policy template (apply to all org-scoped tables)
CREATE POLICY "org_members_can_select" ON contracts
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "org_members_can_insert" ON contracts
  FOR INSERT WITH CHECK (is_org_member(org_id));

CREATE POLICY "org_members_can_update" ON contracts
  FOR UPDATE USING (is_org_member(org_id));

CREATE POLICY "org_admins_can_delete" ON contracts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM organization_members 
            WHERE org_id = contracts.org_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin'))
  );

-- Helper function: user profile access
CREATE POLICY "Users can view their own profile."
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);


-- ============================================
-- STORAGE
-- ============================================
-- Insert the buckets (Requires Supabase Storage extension)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('contracts', 'contracts', false),
  ('evidence', 'evidence', false),
  ('reports', 'reports', false),
  ('avatars', 'avatars', true),
  ('org-logos', 'org-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (run in SQL editor)
CREATE POLICY "Authenticated users can upload contracts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'contracts' AND
  (storage.foldername(name))[1] IN (
    SELECT org_id::text FROM organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Org members can read contracts"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'contracts' AND
  (storage.foldername(name))[1] IN (
    SELECT org_id::text FROM organization_members WHERE user_id = auth.uid()
  )
);

-- ============================================
-- FUNCTIONS
-- ============================================
-- Vector similarity search
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(384),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_org_id UUID DEFAULT NULL,
  filter_source_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source_id UUID,
  source_type TEXT,
  chunk_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.source_id,
    dc.source_type,
    dc.chunk_text,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE 
    (filter_org_id IS NULL OR dc.org_id = filter_org_id)
    AND (filter_source_type IS NULL OR dc.source_type = filter_source_type)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Compute risk score
CREATE OR REPLACE FUNCTION compute_contract_risk(p_contract_id UUID)
RETURNS INT AS $$
DECLARE
  total_obligations INT;
  pending_count INT;
  overdue_count INT;
  low_conf_count INT;
  disputed_count INT;
  risk INT;
BEGIN
  SELECT COUNT(*) INTO total_obligations 
  FROM obligations WHERE contract_id = p_contract_id;
  
  IF total_obligations = 0 THEN RETURN 0; END IF;
  
  SELECT COUNT(*) INTO pending_count 
  FROM obligations 
  WHERE contract_id = p_contract_id AND status = 'pending';
  
  SELECT COUNT(*) INTO overdue_count 
  FROM obligations 
  WHERE contract_id = p_contract_id 
    AND status = 'pending' 
    AND due_date < NOW();
  
  SELECT COUNT(DISTINCT o.id) INTO low_conf_count
  FROM obligations o
  LEFT JOIN obligation_evidence_links l ON l.obligation_id = o.id
  WHERE o.contract_id = p_contract_id 
    AND (l.confidence_score < 0.6 OR l.id IS NULL);
  
  SELECT COUNT(*) INTO disputed_count
  FROM obligations WHERE contract_id = p_contract_id AND status = 'disputed';
  
  risk := LEAST(100, 
    (pending_count * 100 / total_obligations) * 0.25 +
    (overdue_count * 100 / total_obligations) * 0.35 +
    (low_conf_count * 100 / total_obligations) * 0.25 +
    (disputed_count * 100 / total_obligations) * 0.15
  )::INT;
  
  RETURN risk;
END;
$$ LANGUAGE plpgsql;

-- Trigger: auto-create timeline event on obligation status change
CREATE OR REPLACE FUNCTION log_obligation_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO timeline_events (
      org_id, contract_id, obligation_id, event_type, title, description, severity
    ) VALUES (
      NEW.org_id, NEW.contract_id, NEW.id, 
      'obligation_status_changed',
      'Obligation status: ' || OLD.status || ' → ' || NEW.status,
      NEW.obligation_summary,
      CASE NEW.status 
        WHEN 'breached' THEN 'critical'
        WHEN 'verified' THEN 'success'
        ELSE 'info'
      END
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER obligation_change_trigger
AFTER UPDATE ON obligations
FOR EACH ROW EXECUTE FUNCTION log_obligation_change();
