/*
  # Financial Control System Schema

  ## Overview
  This migration creates the core tables for a personal financial control system with proper security.

  ## New Tables
  
  ### `income`
  - `id` (uuid, primary key) - Unique identifier for income record
  - `user_id` (uuid, foreign key) - References auth.users, identifies the owner
  - `amount` (numeric) - Monthly income amount
  - `month_year` (text) - Month and year in format "YYYY-MM"
  - `description` (text) - Optional description of income source
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `expenses`
  - `id` (uuid, primary key) - Unique identifier for expense
  - `user_id` (uuid, foreign key) - References auth.users, identifies the owner
  - `description` (text) - Description of the expense
  - `amount` (numeric) - Expense amount
  - `category` (text) - Category of expense (food, transport, entertainment, etc)
  - `date` (date) - Date when expense occurred
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  Both tables have RLS enabled to ensure users can only access their own data.
  
  ### Policies
  
  #### Income Policies
  1. Users can view their own income records
  2. Users can insert their own income records
  3. Users can update their own income records
  4. Users can delete their own income records
  
  #### Expenses Policies
  1. Users can view their own expenses
  2. Users can insert their own expenses
  3. Users can update their own expenses
  4. Users can delete their own expenses
*/

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  month_year text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  category text DEFAULT 'other',
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Income Policies
CREATE POLICY "Users can view own income"
  ON income FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income"
  ON income FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income"
  ON income FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income"
  ON income FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Expenses Policies
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS income_user_id_idx ON income(user_id);
CREATE INDEX IF NOT EXISTS income_month_year_idx ON income(month_year);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_income_updated_at ON income;
CREATE TRIGGER update_income_updated_at
  BEFORE UPDATE ON income
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();