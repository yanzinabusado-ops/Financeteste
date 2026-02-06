# Documentação Técnica - FinanceControl

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Componentes](#componentes)
5. [Contextos e Hooks](#contextos-e-hooks)
6. [Biblioteca de Utilitários](#biblioteca-de-utilitários)
7. [Banco de Dados](#banco-de-dados)
8. [Fluxo de Dados](#fluxo-de-dados)
9. [Segurança](#segurança)
10. [Testes](#testes)

---

## Visão Geral

FinanceControl é uma aplicação web de controle financeiro pessoal com análise inteligente de dados. O sistema permite gerenciar receitas, despesas, orçamentos e fornece insights automáticos sobre o comportamento financeiro do usuário.

### Tecnologias Principais

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Gráficos**: Chart.js + react-chartjs-2
- **Ícones**: Lucide React
- **Testes**: Vitest + Fast-check

---

## Arquitetura

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    CAMADA DE APRESENTAÇÃO               │
│                     (React Components)                  │
├─────────────────────────────────────────────────────────┤
│  Dashboard │ Auth │ Insights │ Charts │ Modals         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE LÓGICA                      │
│              (Contexts, Hooks, Utils)                   │
├─────────────────────────────────────────────────────────┤
│  AuthContext │ Custom Hooks │ Analytics │ Budgets      │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   CAMADA DE DADOS                       │
│                  (Supabase Client)                      │
├─────────────────────────────────────────────────────────┤
│  Auth API │ Database API │ Real-time Subscriptions     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                            │
│              (Supabase PostgreSQL + RLS)                │
├─────────────────────────────────────────────────────────┤
│  users │ income │ expenses │ budgets │ transitions     │
└─────────────────────────────────────────────────────────┘
```

### Padrões de Arquitetura

- **Component-Based Architecture**: Componentes reutilizáveis e isolados
- **Context API**: Gerenciamento de estado global (autenticação)
- **Custom Hooks**: Lógica reutilizável e separação de concerns
- **Utility Functions**: Funções puras para cálculos e análises
- **Row Level Security (RLS)**: Segurança no nível do banco de dados

---

## Estrutura do Projeto

```
FinanceControl/
├── src/
│   ├── components/          # Componentes React
│   │   ├── AddExpense.tsx
│   │   ├── AppTour.tsx
│   │   ├── AuthPage.tsx
│   │   ├── BehaviorInsights.tsx
│   │   ├── BudgetAlerts.tsx
│   │   ├── BudgetManager.tsx
│   │   ├── BudgetSettingsModal.tsx
│   │   ├── CategorySpendingChart.tsx
│   │   ├── ComparisonInsights.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ExpenseItem.tsx
│   │   ├── ExpensesChart.tsx
│   │   ├── ExpensesList.tsx
│   │   ├── FinancialInsights.tsx
│   │   ├── IncomeCard.tsx
│   │   ├── InsightsHub.tsx
│   │   ├── Login.tsx
│   │   ├── MonthlyProjectionCard.tsx
│   │   ├── MonthTransitionModal.tsx
│   │   ├── Register.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── TopExpenses.tsx
│   │   ├── UserProfileMenu.tsx
│   │   └── WelcomeAnimation.tsx
│   │
│   ├── contexts/            # Context API
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/              # Custom Hooks
│   │   └── useExpenses.ts
│   │
│   ├── lib/                # Utilitários e configurações
│   │   ├── analytics.ts
│   │   ├── analytics.test.ts
│   │   ├── budgets.ts
│   │   ├── insights.ts
│   │   └── supabase.ts
│   │
│   ├── types/              # TypeScript Types
│   │   └── database.ts
│   │
│   ├── App.tsx             # Componente raiz
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais
│
├── supabase/
│   ├── migrations/         # SQL Migrations
│   │   ├── 00_complete_setup.sql
│   │   ├── 01_add_budgets.sql
│   │   ├── 02_add_budget_alerts.sql
│   │   ├── 03_add_budget_categories.sql
│   │   ├── 04_add_month_transitions.sql
│   │   └── 05_add_user_profiles.sql
│   └── README.md
│
├── docs/                   # Documentação
│   └── DOCUMENTATION.md
│
├── .env                    # Variáveis de ambiente
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Componentes

### Componentes de Autenticação

#### `AuthPage.tsx`
Página principal de autenticação que alterna entre Login e Register.

**Props**: Nenhuma

**Estado**:
- `isLogin`: boolean - Controla exibição de login vs registro

#### `Login.tsx`
Formulário de login com validação.

**Features**:
- Validação de email
- Indicador de força de senha
- Rate limiting (5 tentativas/minuto)
- Mensagens de erro amigáveis

#### `Register.tsx`
Formulário de registro com validação avançada.

**Features**:
- Validação de email com regex
- Validação de senha forte (8+ caracteres, maiúsculas, minúsculas, números)
- Indicador visual de força de senha
- Confirmação de senha

### Componentes do Dashboard

#### `Dashboard.tsx`
Componente principal que orquestra toda a interface do usuário autenticado.

**Estrutura**:
```tsx
<Dashboard>
  <Header>
    <UserProfileMenu />
  </Header>
  <Main>
    <SummaryCards />
    <IncomeCard />
    <BudgetManager />
    <AddExpense />
    <InsightsHub />
    <CategorySpendingChart />
    <ExpensesList />
  </Main>
</Dashboard>
```

**Estado Gerenciado**:
- Lista de despesas
- Receita mensal
- Orçamentos
- Transições de mês

#### `SummaryCards.tsx`
Cards de resumo financeiro (Receita, Gastos, Saldo).

**Props**:
```typescript
interface SummaryCardsProps {
  income: number;
  expenses: Expense[];
}
```

**Cálculos**:
- Total de gastos
- Saldo restante
- Percentual gasto

#### `IncomeCard.tsx`
Card para definir/editar receita mensal.

**Props**:
```typescript
interface IncomeCardProps {
  income: number;
  onIncomeUpdate: (newIncome: number) => void;
}
```

**Features**:
- Edição inline
- Validação de valor
- Formatação de moeda

### Componentes de Despesas

#### `AddExpense.tsx`
Formulário para adicionar nova despesa.

**Props**:
```typescript
interface AddExpenseProps {
  onExpenseAdded: () => void;
}
```

**Campos**:
- Descrição (max 200 caracteres)
- Valor (validação numérica)
- Categoria (select)
- Data

**Categorias Disponíveis**:
- Alimentação
- Transporte
- Moradia
- Saúde
- Lazer
- Educação
- Compras
- Contas
- Outros

#### `ExpensesList.tsx`
Lista de despesas com filtros e ações.

**Props**:
```typescript
interface ExpensesListProps {
  expenses: Expense[];
  onExpenseDeleted: () => void;
  onExpenseUpdated: () => void;
}
```

**Features**:
- Filtro por categoria
- Ordenação por data/valor
- Edição inline
- Exclusão com confirmação
- Paginação

#### `ExpenseItem.tsx`
Item individual de despesa.

**Props**:
```typescript
interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Expense>) => void;
}
```

### Componentes de Orçamento

#### `BudgetManager.tsx`
Gerenciador de orçamentos por categoria.

**Features**:
- Criação de orçamentos
- Visualização de progresso
- Alertas de limite
- Edição/exclusão

**Props**:
```typescript
interface BudgetManagerProps {
  expenses: Expense[];
}
```

#### `BudgetAlerts.tsx`
Sistema de alertas de orçamento.

**Tipos de Alerta**:
- ⚠️ Atenção: 80-100% do orçamento
- 🚨 Crítico: >100% do orçamento

#### `BudgetSettingsModal.tsx`
Modal para configurar orçamento de uma categoria.

**Props**:
```typescript
interface BudgetSettingsModalProps {
  category: string;
  currentBudget: number;
  onSave: (amount: number) => void;
  onClose: () => void;
}
```

### Componentes de Insights

#### `InsightsHub.tsx`
Hub central de insights financeiros.

**Componentes Filhos**:
- `FinancialInsights`
- `BehaviorInsights`
- `ComparisonInsights`
- `MonthlyProjectionCard`

#### `FinancialInsights.tsx`
Insights sobre situação financeira atual.

**Insights Gerados**:
- Categoria com maior gasto
- Percentual da receita gasto
- Média de gasto diário
- Dias restantes no mês

#### `BehaviorInsights.tsx`
Análise de padrões de comportamento.

**Análises**:
- Frequência de gastos
- Horários de maior gasto
- Padrões de categoria
- Tendências

#### `ComparisonInsights.tsx`
Comparação com mês anterior.

**Métricas**:
- Variação de gastos totais
- Variação por categoria
- Economia/excesso

#### `MonthlyProjectionCard.tsx`
Projeção de gastos para fim do mês.

**Cálculo**:
```typescript
projeção = (gastoAtual / diasDecorridos) * diasNoMês
```

### Componentes de Gráficos

#### `CategorySpendingChart.tsx`
Gráfico de pizza mostrando distribuição de gastos por categoria.

**Biblioteca**: Chart.js

**Props**:
```typescript
interface CategorySpendingChartProps {
  expenses: Expense[];
}
```

**Features**:
- Gráfico interativo
- Legenda com valores e percentuais
- Barras de progresso
- Cores por categoria

#### `ExpensesChart.tsx`
Gráfico de linha mostrando evolução de gastos.

**Tipos**:
- Gastos diários
- Gastos semanais
- Gastos mensais

### Componentes de UX

#### `WelcomeAnimation.tsx`
Animação de boas-vindas para novos usuários.

**Features**:
- Animação de entrada
- Mensagem personalizada
- Auto-dismiss após 3s

#### `AppTour.tsx`
Tour guiado pela aplicação.

**Etapas**:
1. Definir receita
2. Adicionar despesa
3. Configurar orçamento
4. Ver insights

#### `MonthTransitionModal.tsx`
Modal de transição de mês.

**Features**:
- Resumo do mês anterior
- Opção de manter/zerar dados
- Animação de transição

#### `UserProfileMenu.tsx`
Menu de perfil do usuário.

**Opções**:
- Ver perfil
- Sair

#### `ErrorBoundary.tsx`
Componente para capturar erros React.

**Features**:
- Captura de erros
- Mensagem amigável
- Botão de reload

---

## Contextos e Hooks

### AuthContext

Gerencia autenticação global da aplicação.

**Arquivo**: `src/contexts/AuthContext.tsx`

**Estado**:
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

**Funcionalidades**:
- Persistência de sessão
- Auto-login
- Gerenciamento de tokens JWT
- Listeners de mudança de auth

**Uso**:
```typescript
const { user, signIn, signOut } = useAuth();
```

### Custom Hooks

#### `useExpenses`
Hook para gerenciar despesas.

**Arquivo**: `src/hooks/useExpenses.ts`

**Retorno**:
```typescript
interface UseExpensesReturn {
  expenses: Expense[];
  loading: boolean;
  error: Error | null;
  addExpense: (expense: NewExpense) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}
```

**Features**:
- Cache local
- Otimistic updates
- Error handling
- Real-time sync

---

## Biblioteca de Utilitários

### analytics.ts

Funções de análise financeira.

**Funções Principais**:

```typescript
// Calcula total de gastos
calculateTotalExpenses(expenses: Expense[]): number

// Agrupa gastos por categoria
groupExpensesByCategory(expenses: Expense[]): CategoryTotal[]

// Calcula média diária
calculateDailyAverage(expenses: Expense[]): number

// Identifica categoria com maior gasto
getTopCategory(expenses: Expense[]): string

// Calcula projeção mensal
calculateMonthlyProjection(expenses: Expense[], currentDay: number): number

// Compara com mês anterior
compareWithPreviousMonth(
  currentExpenses: Expense[],
  previousExpenses: Expense[]
): Comparison
```

**Testes**: `analytics.test.ts` com property-based testing

### budgets.ts

Gerenciamento de orçamentos.

**Funções**:

```typescript
// Calcula progresso do orçamento
calculateBudgetProgress(
  spent: number,
  budget: number
): BudgetProgress

// Verifica se orçamento foi excedido
isBudgetExceeded(spent: number, budget: number): boolean

// Calcula quanto falta para o limite
getRemainingBudget(spent: number, budget: number): number

// Gera alertas de orçamento
generateBudgetAlerts(
  expenses: Expense[],
  budgets: Budget[]
): Alert[]
```

### insights.ts

Geração de insights automáticos.

**Funções**:

```typescript
// Gera insights financeiros
generateFinancialInsights(
  expenses: Expense[],
  income: number
): Insight[]

// Analisa padrões de comportamento
analyzeBehaviorPatterns(expenses: Expense[]): Pattern[]

// Identifica anomalias
detectAnomalies(expenses: Expense[]): Anomaly[]

// Sugere otimizações
suggestOptimizations(
  expenses: Expense[],
  budgets: Budget[]
): Suggestion[]
```

### supabase.ts

Cliente e configuração do Supabase.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## Banco de Dados

### Schema

#### Tabela: `income`
```sql
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: `expenses`
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  description VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: `budgets`
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2000),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category, month, year)
);
```

#### Tabela: `month_transitions`
```sql
CREATE TABLE month_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  from_month INTEGER NOT NULL,
  from_year INTEGER NOT NULL,
  to_month INTEGER NOT NULL,
  to_year INTEGER NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('keep', 'reset')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas:

```sql
-- Política de SELECT
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- Política de INSERT
CREATE POLICY "Users can insert own data"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE
CREATE POLICY "Users can update own data"
ON table_name FOR UPDATE
USING (auth.uid() = user_id);

-- Política de DELETE
CREATE POLICY "Users can delete own data"
ON table_name FOR DELETE
USING (auth.uid() = user_id);
```

### Índices

```sql
-- Índices para performance
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_budgets_user_period ON budgets(user_id, year, month);
CREATE INDEX idx_income_user_period ON income(user_id, year, month);
```

---

## Fluxo de Dados

### Fluxo de Autenticação

```
1. Usuário preenche formulário
   ↓
2. Validação no frontend
   ↓
3. Chamada para Supabase Auth
   ↓
4. Supabase valida credenciais
   ↓
5. Retorna JWT token
   ↓
6. AuthContext atualiza estado
   ↓
7. App redireciona para Dashboard
```

### Fluxo de Adição de Despesa

```
1. Usuário preenche formulário AddExpense
   ↓
2. Validação de campos (descrição, valor, categoria)
   ↓
3. Sanitização de dados
   ↓
4. INSERT na tabela expenses via Supabase
   ↓
5. RLS valida user_id
   ↓
6. Callback onExpenseAdded()
   ↓
7. Dashboard refetch expenses
   ↓
8. Atualização de todos os componentes dependentes:
   - SummaryCards
   - CategorySpendingChart
   - ExpensesList
   - InsightsHub
   - BudgetAlerts
```

### Fluxo de Insights

```
1. Dashboard carrega expenses
   ↓
2. InsightsHub recebe expenses como prop
   ↓
3. Cada componente de insight processa dados:
   - FinancialInsights: analytics.ts
   - BehaviorInsights: insights.ts
   - ComparisonInsights: analytics.ts
   ↓
4. Renderização de insights
   ↓
5. Auto-atualização a cada mudança em expenses
```

---

## Segurança

### Autenticação

- JWT tokens gerenciados pelo Supabase
- Tokens armazenados em httpOnly cookies
- Refresh automático de tokens
- Logout em todas as abas (broadcast channel)

### Autorização

- Row Level Security (RLS) em todas as tabelas
- Políticas baseadas em `auth.uid()`
- Validação de user_id em todas as operações

### Validação de Inputs

**Frontend**:
```typescript
// Validação de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validação de senha
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Sanitização de descrição
const sanitize = (text: string) => text.replace(/[<>]/g, '');

// Validação de valor
const isValidAmount = (amount: number) => amount > 0 && amount < 1000000;
```

**Backend (RLS)**:
```sql
-- Constraints no banco
CHECK (amount > 0)
CHECK (amount < 1000000)
CHECK (LENGTH(description) <= 200)
```

### Proteção contra Ataques

- **XSS**: Sanitização de inputs, uso de React (auto-escape)
- **SQL Injection**: Prepared statements do Supabase
- **CSRF**: Tokens gerenciados pelo Supabase
- **Rate Limiting**: 5 tentativas de login por minuto

### Dados Sensíveis

- Senhas: Hash bcrypt pelo Supabase
- Tokens: Armazenados em httpOnly cookies
- Dados financeiros: Criptografados em trânsito (HTTPS)
- Nenhum dado sensível em localStorage

---

## Testes

### Estrutura de Testes

```
src/
├── lib/
│   ├── analytics.ts
│   └── analytics.test.ts
```

### Tipos de Testes

#### Unit Tests
Testes de funções puras em `analytics.ts`:

```typescript
describe('calculateTotalExpenses', () => {
  it('should return 0 for empty array', () => {
    expect(calculateTotalExpenses([])).toBe(0);
  });

  it('should sum all expenses', () => {
    const expenses = [
      { amount: 100 },
      { amount: 200 },
      { amount: 50 }
    ];
    expect(calculateTotalExpenses(expenses)).toBe(350);
  });
});
```

#### Property-Based Tests
Usando fast-check para testes generativos:

```typescript
import fc from 'fast-check';

it('total should always be >= 0', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({ amount: fc.float({ min: 0 }) })),
      (expenses) => {
        const total = calculateTotalExpenses(expenses);
        return total >= 0;
      }
    )
  );
});
```

### Executar Testes

```bash
# Executar todos os testes
npm run test

# Modo watch
npm run test:watch

# Com UI
npm run test:ui

# Com coverage
npm run test -- --coverage
```

### Coverage

Objetivo: >80% de cobertura em funções críticas:
- analytics.ts
- budgets.ts
- insights.ts

---

## Guia de Desenvolvimento

### Setup do Ambiente

1. Clone o repositório
2. Instale dependências: `npm install`
3. Configure `.env` com credenciais do Supabase
4. Execute migrations no Supabase
5. Inicie dev server: `npm run dev`

### Convenções de Código

**TypeScript**:
- Sempre tipar props e estado
- Usar interfaces para objetos complexos
- Evitar `any`

**React**:
- Componentes funcionais com hooks
- Props destructuring
- Nomes descritivos

**CSS**:
- Tailwind CSS classes
- Evitar CSS inline quando possível
- Classes utilitárias

**Commits**:
- Mensagens descritivas
- Formato: `tipo: descrição`
- Tipos: feat, fix, docs, style, refactor, test

### Adicionar Nova Feature

1. Criar branch: `git checkout -b feature/nome`
2. Desenvolver feature
3. Adicionar testes
4. Atualizar documentação
5. Commit e push
6. Abrir Pull Request

---

## Troubleshooting

### Problemas Comuns

**Erro de autenticação**:
- Verificar credenciais no `.env`
- Verificar se projeto Supabase está ativo
- Limpar cache do navegador

**Dados não carregam**:
- Verificar RLS policies no Supabase
- Verificar console do navegador
- Verificar network tab

**Build falha**:
- Limpar node_modules: `rm -rf node_modules && npm install`
- Verificar versão do Node.js (18+)
- Executar `npm run typecheck`

---

## Roadmap

### Próximas Features

- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Gráficos de tendência
- [ ] Metas financeiras
- [ ] Categorias personalizadas
- [ ] Multi-moeda
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Integração com bancos
- [ ] Machine Learning para previsões

---

## Contribuindo

Veja [CONTRIBUTING.md](../CONTRIBUTING.md) para detalhes sobre como contribuir.

## Licença

MIT License - veja [LICENSE](../LICENSE) para detalhes.

---

**Última atualização**: 2026-02-06
**Versão**: 2.0.0
