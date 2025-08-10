-- Create tables for Arena Audit System
-- This script creates the necessary tables to store nightly audit results

-- Table to store audit run metadata
CREATE TABLE IF NOT EXISTS arena_audit_runs (
    id TEXT PRIMARY KEY,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_submissions INTEGER DEFAULT 0,
    passed_count INTEGER DEFAULT 0,
    minor_count INTEGER DEFAULT 0,
    major_count INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    average_deviation DECIMAL(5,2) DEFAULT 0,
    critical_issues_count INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('running', 'completed', 'failed')) DEFAULT 'running',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store individual audit results
CREATE TABLE IF NOT EXISTS arena_audit_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    audit_run_id TEXT NOT NULL REFERENCES arena_audit_runs(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id),
    user_id UUID NOT NULL REFERENCES users(id),
    skill_area TEXT NOT NULL,
    original_score INTEGER NOT NULL,
    new_score INTEGER NOT NULL,
    deviation INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pass', 'minor', 'major', 'critical')) NOT NULL,
    critical_issue BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_arena_audit_runs_status ON arena_audit_runs(status);
CREATE INDEX IF NOT EXISTS idx_arena_audit_runs_started_at ON arena_audit_runs(started_at);
CREATE INDEX IF NOT EXISTS idx_arena_audit_results_audit_run_id ON arena_audit_results(audit_run_id);
CREATE INDEX IF NOT EXISTS idx_arena_audit_results_task_id ON arena_audit_results(task_id);
CREATE INDEX IF NOT EXISTS idx_arena_audit_results_user_id ON arena_audit_results(user_id);
CREATE INDEX IF NOT EXISTS idx_arena_audit_results_skill_area ON arena_audit_results(skill_area);
CREATE INDEX IF NOT EXISTS idx_arena_audit_results_status ON arena_audit_results(status);
CREATE INDEX IF NOT EXISTS idx_arena_audit_results_critical_issue ON arena_audit_results(critical_issue);
CREATE INDEX IF NOT EXISTS idx_arena_audit_results_timestamp ON arena_audit_results(timestamp);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_arena_audit_runs_updated_at 
    BEFORE UPDATE ON arena_audit_runs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE arena_audit_runs IS 'Stores metadata for each nightly audit run';
COMMENT ON TABLE arena_audit_results IS 'Stores individual submission audit results';
COMMENT ON COLUMN arena_audit_runs.id IS 'Unique identifier for the audit run (format: audit_YYYY-MM-DD_timestamp)';
COMMENT ON COLUMN arena_audit_runs.status IS 'Current status of the audit run: running, completed, or failed';
COMMENT ON COLUMN arena_audit_results.deviation IS 'Absolute difference between original and new score';
COMMENT ON COLUMN arena_audit_results.status IS 'Classification of the deviation: pass (≤5), minor (≤10), major (≤15), critical (>15)';
COMMENT ON COLUMN arena_audit_results.critical_issue IS 'Flag for deviations greater than 15 points';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON arena_audit_runs TO authenticated;
-- GRANT SELECT, INSERT ON arena_audit_results TO authenticated; 