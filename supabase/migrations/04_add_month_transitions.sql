-- Create month_transitions table to track when users have seen the month transition modal
CREATE TABLE IF NOT EXISTS month_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: YYYY-MM
  previous_month_total DECIMAL(12, 2) DEFAULT 0,
  previous_month_expenses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per user per month
  UNIQUE(user_id, month_year)
);

-- Create index for faster queries
CREATE INDEX idx_month_transitions_user_month ON month_transitions(user_id, month_year);

-- Enable RLS
ALTER TABLE month_transitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own month transitions"
  ON month_transitions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own month transitions"
  ON month_transitions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own month transitions"
  ON month_transitions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own month transitions"
  ON month_transitions
  FOR DELETE
  USING (auth.uid() = user_id);
