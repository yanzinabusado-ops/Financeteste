/*
  # Add Category Budgets Table

  ## Overview
  This migration creates the category_budgets table to allow users to set spending limits per category per month.

  ## New Tables
  
  ### `category_budgets`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `month_year` (text) - Month in format "YYYY-MM"
  - `category` (text) - Category name (food, transport, etc)
  - `limit_amount` (numeric) - Budget limit for the category in that month
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## Security
  - Enable RLS with policies to ensure users can only access their own budgets
  - Unique constraint on (user_id, month_year, category) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS category_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  category text NOT NULL,
  limit_amount numeric NOT NULL CHECK (limit_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year, category)
);

ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.schemata 
    WHERE schema_name = 'public'
  ) THEN
    CREATE SCHEMA public;
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own category budgets" ON category_budgets;
DROP POLICY IF EXISTS "Users can insert own category budgets" ON category_budgets;
DROP POLICY IF EXISTS "Users can update own category budgets" ON category_budgets;
DROP POLICY IF EXISTS "Users can delete own category budgets" ON category_budgets;

CREATE POLICY "Users can view own category budgets"
  ON category_budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category budgets"
  ON category_budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category budgets"
  ON category_budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own category budgets"
  ON category_budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS category_budgets_user_month_idx ON category_budgets(user_id, month_year);
CREATE INDEX IF NOT EXISTS category_budgets_category_idx ON category_budgets(category);
