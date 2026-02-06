/*
  # Setup Completo do FinanceControl
  
  Esta migration cria todas as tabelas necessárias para o sistema de controle financeiro.
  
  ## Tabelas Criadas
  
  1. **income** - Renda mensal dos usuários
  2. **expenses** - Despesas dos usuários
  3. **category_budgets** - Orçamentos por categoria
  4. **dismissed_insights** - Insights descartados pelos usuários
  5. **month_transitions** - Controle de transições de mês
  
  ## Segurança
  
  - Row Level Security (RLS) habilitado em todas as tabelas
  - Policies para garantir que usuários só acessem seus próprios dados
  - Constraints para validação de dados
  
  ## Performance
  
  - Índices otimizados para queries frequentes
  - Triggers para atualização automática de timestamps
*/

-- ============================================
-- 1. CRIAR TABELAS
-- ============================================

-- Tabela de renda mensal
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  month_year text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de despesas
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

-- Tabela de orçamentos por categoria
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

-- Tabela de insights descartados
CREATE TABLE IF NOT EXISTS dismissed_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_key text NOT NULL,
  dismissed_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE(user_id, insight_key)
);

-- Tabela de transições de mês
CREATE TABLE IF NOT EXISTS month_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  previous_month_total numeric DEFAULT 0,
  previous_month_expenses_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- ============================================
-- 2. HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dismissed_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_transitions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CRIAR POLICIES - INCOME
-- ============================================

DROP POLICY IF EXISTS "Users can view own income" ON income;
CREATE POLICY "Users can view own income"
  ON income FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own income" ON income;
CREATE POLICY "Users can insert own income"
  ON income FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own income" ON income;
CREATE POLICY "Users can update own income"
  ON income FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own income" ON income;
CREATE POLICY "Users can delete own income"
  ON income FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 4. CRIAR POLICIES - EXPENSES
-- ============================================

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 5. CRIAR POLICIES - CATEGORY_BUDGETS
-- ============================================

DROP POLICY IF EXISTS "Users can view own category budgets" ON category_budgets;
CREATE POLICY "Users can view own category budgets"
  ON category_budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own category budgets" ON category_budgets;
CREATE POLICY "Users can insert own category budgets"
  ON category_budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own category budgets" ON category_budgets;
CREATE POLICY "Users can update own category budgets"
  ON category_budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own category budgets" ON category_budgets;
CREATE POLICY "Users can delete own category budgets"
  ON category_budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 6. CRIAR POLICIES - DISMISSED_INSIGHTS
-- ============================================

DROP POLICY IF EXISTS "Users can view own dismissed insights" ON dismissed_insights;
CREATE POLICY "Users can view own dismissed insights"
  ON dismissed_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own dismissed insights" ON dismissed_insights;
CREATE POLICY "Users can insert own dismissed insights"
  ON dismissed_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own dismissed insights" ON dismissed_insights;
CREATE POLICY "Users can update own dismissed insights"
  ON dismissed_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own dismissed insights" ON dismissed_insights;
CREATE POLICY "Users can delete own dismissed insights"
  ON dismissed_insights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 7. CRIAR POLICIES - MONTH_TRANSITIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view own month transitions" ON month_transitions;
CREATE POLICY "Users can view own month transitions"
  ON month_transitions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own month transitions" ON month_transitions;
CREATE POLICY "Users can insert own month transitions"
  ON month_transitions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own month transitions" ON month_transitions;
CREATE POLICY "Users can update own month transitions"
  ON month_transitions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own month transitions" ON month_transitions;
CREATE POLICY "Users can delete own month transitions"
  ON month_transitions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 8. CRIAR ÍNDICES
-- ============================================

-- Índices para income
CREATE INDEX IF NOT EXISTS income_user_id_idx ON income(user_id);
CREATE INDEX IF NOT EXISTS income_month_year_idx ON income(month_year);

-- Índices para expenses
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);

-- Índices para category_budgets
CREATE INDEX IF NOT EXISTS category_budgets_user_month_idx ON category_budgets(user_id, month_year);
CREATE INDEX IF NOT EXISTS category_budgets_category_idx ON category_budgets(category);

-- Índices para dismissed_insights
CREATE INDEX IF NOT EXISTS dismissed_insights_user_idx ON dismissed_insights(user_id);
CREATE INDEX IF NOT EXISTS dismissed_insights_expires_idx ON dismissed_insights(expires_at);
CREATE INDEX IF NOT EXISTS dismissed_insights_user_key_idx ON dismissed_insights(user_id, insight_key);

-- Índices para month_transitions
CREATE INDEX IF NOT EXISTS month_transitions_user_month_idx ON month_transitions(user_id, month_year);

-- ============================================
-- 9. CRIAR FUNÇÃO E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para income
DROP TRIGGER IF EXISTS update_income_updated_at ON income;
CREATE TRIGGER update_income_updated_at
  BEFORE UPDATE ON income
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para expenses
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para category_budgets
DROP TRIGGER IF EXISTS update_category_budgets_updated_at ON category_budgets;
CREATE TRIGGER update_category_budgets_updated_at
  BEFORE UPDATE ON category_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
