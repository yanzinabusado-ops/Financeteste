/*
  # Add Dismissed Insights Table

  ## Overview
  This migration creates the dismissed_insights table to track which insights users have dismissed
  and enforce a 24-hour cooldown period before showing them again.

  ## New Tables
  
  ### `dismissed_insights`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `insight_key` (text) - Unique key identifying the insight type/content
  - `dismissed_at` (timestamptz) - When the insight was dismissed
  - `expires_at` (timestamptz) - When the dismissal expires (24 hours after dismissed_at)
  - Unique constraint on (user_id, insight_key) to prevent duplicate dismissals

  ## Security
  - Enable RLS with policies to ensure users can only access their own dismissed insights
  
  ## Performance
  - Index on user_id for fast user-specific queries
  - Index on expires_at for efficient cleanup of expired dismissals
*/

-- Create dismissed_insights table
CREATE TABLE IF NOT EXISTS dismissed_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_key text NOT NULL,
  dismissed_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE(user_id, insight_key)
);

-- Enable RLS
ALTER TABLE dismissed_insights ENABLE ROW LEVEL SECURITY;

-- Dismissed Insights Policies
CREATE POLICY "Users can view own dismissed insights"
  ON dismissed_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dismissed insights"
  ON dismissed_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dismissed insights"
  ON dismissed_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dismissed insights"
  ON dismissed_insights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS dismissed_insights_user_idx ON dismissed_insights(user_id);
CREATE INDEX IF NOT EXISTS dismissed_insights_expires_idx ON dismissed_insights(expires_at);
CREATE INDEX IF NOT EXISTS dismissed_insights_user_key_idx ON dismissed_insights(user_id, insight_key);

-- Create trigger for updated_at if we add that column in the future
-- (Currently not needed as dismissals are typically insert-only)
