# 🗄️ Migrations do Supabase - FinanceControl

Este diretório contém todas as migrations do banco de dados para o projeto FinanceControl.

## 📁 Estrutura

```
supabase/migrations/
├── 00_complete_setup.sql ......... Setup completo (RECOMENDADO)
├── 01_initial_setup.sql .......... Tabelas principais (income + expenses)
├── 02_add_insights.sql ........... Tabela de insights descartados
└── 03_add_budgets.sql ............ Tabela de orçamentos por categoria
```

## 🚀 Como Usar

### Opção 1: Migration Completa (Recomendado para Novos Projetos)

Use o arquivo `00_complete_setup.sql` que cria tudo de uma vez:

**Via Supabase CLI**:
```bash
supabase db push
```

**Via SQL Editor**:
1. Copie o conteúdo de `00_complete_setup.sql`
2. Cole no SQL Editor do Supabase
3. Execute

### Opção 2: Migrations Incrementais

Se preferir executar uma por uma (útil para projetos existentes):

1. `01_initial_setup.sql` - Cria tabelas income e expenses
2. `02_add_insights.sql` - Adiciona tabela dismissed_insights
3. `03_add_budgets.sql` - Adiciona tabela category_budgets

Execute na ordem!

### Opção 3: Arquivo Único (Alternativa)

Use o arquivo `setup_database.sql` na raiz do projeto (mesmo conteúdo que `00_complete_setup.sql`).

## 📊 Tabelas Criadas

### 1. income (Renda Mensal)

Armazena a renda mensal dos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único (PK) |
| user_id | uuid | ID do usuário (FK → auth.users) |
| amount | numeric | Valor da renda (≥ 0) |
| month_year | text | Mês/ano (formato: "2026-02") |
| description | text | Descrição opcional |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |

**Índices**:
- `income_user_id_idx` - Busca por usuário
- `income_month_year_idx` - Busca por período

**RLS**: ✅ Habilitado (4 policies)

---

### 2. expenses (Despesas)

Armazena as despesas dos usuários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único (PK) |
| user_id | uuid | ID do usuário (FK → auth.users) |
| description | text | Descrição da despesa |
| amount | numeric | Valor (≥ 0) |
| category | text | Categoria (food, transport, etc) |
| date | date | Data da despesa |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |

**Índices**:
- `expenses_user_id_idx` - Busca por usuário
- `expenses_date_idx` - Busca por data
- `expenses_category_idx` - Busca por categoria

**RLS**: ✅ Habilitado (4 policies)

---

### 3. category_budgets (Orçamentos por Categoria)

Permite definir limites de gastos por categoria e mês.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único (PK) |
| user_id | uuid | ID do usuário (FK → auth.users) |
| month_year | text | Mês/ano (formato: "2026-02") |
| category | text | Categoria |
| limit_amount | numeric | Limite de gastos (≥ 0) |
| created_at | timestamptz | Data de criação |
| updated_at | timestamptz | Data de atualização |

**Constraints**:
- UNIQUE(user_id, month_year, category) - Evita duplicatas

**Índices**:
- `category_budgets_user_month_idx` - Busca por usuário e mês
- `category_budgets_category_idx` - Busca por categoria

**RLS**: ✅ Habilitado (4 policies)

---

### 4. dismissed_insights (Insights Descartados)

Rastreia quais insights o usuário descartou (cooldown de 24h).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | Identificador único (PK) |
| user_id | uuid | ID do usuário (FK → auth.users) |
| insight_key | text | Chave única do insight |
| dismissed_at | timestamptz | Quando foi descartado |
| expires_at | timestamptz | Quando expira (24h depois) |

**Constraints**:
- UNIQUE(user_id, insight_key) - Evita duplicatas

**Índices**:
- `dismissed_insights_user_idx` - Busca por usuário
- `dismissed_insights_expires_idx` - Limpeza de expirados
- `dismissed_insights_user_key_idx` - Verificação rápida

**RLS**: ✅ Habilitado (4 policies)

## 🔐 Segurança (RLS)

Todas as tabelas têm Row Level Security habilitado com 4 policies cada:

1. **SELECT** - Usuários veem apenas seus dados
2. **INSERT** - Usuários criam apenas para si
3. **UPDATE** - Usuários editam apenas seus dados
4. **DELETE** - Usuários deletam apenas seus dados

**Total**: 16 policies (4 tabelas × 4 policies)

## ⚡ Performance

### Índices Criados

- **7 índices simples** para buscas rápidas
- **3 índices compostos** para queries complexas
- **Total**: 10 índices

### Triggers

- **3 triggers** para atualização automática de `updated_at`
- Função compartilhada: `update_updated_at_column()`

## 🔍 Verificar Instalação

### Via SQL Editor

```sql
-- Ver todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Resultado esperado:
-- category_budgets
-- dismissed_insights
-- expenses
-- income
```

### Ver Policies

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Deve retornar 16 policies
```

### Ver Índices

```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Deve retornar 10+ índices
```

## 🛠️ Comandos Úteis

### Criar Nova Migration

```bash
supabase migration new nome_descritivo
```

### Aplicar Migrations

```bash
supabase db push
```

### Resetar Banco Local

```bash
supabase db reset
```

### Ver Status

```bash
supabase status
```

## 📝 Convenções de Nomenclatura

### Migrations

- `00_` - Setup completo
- `01_` - Setup inicial
- `02_` - Adições incrementais
- `03_` - Mais adições

### Tabelas

- Nomes no plural (expenses, budgets)
- Snake_case (category_budgets)
- Descritivos e claros

### Colunas

- `id` - Sempre UUID
- `user_id` - Sempre FK para auth.users
- `created_at` / `updated_at` - Timestamps padrão
- Snake_case para nomes compostos

### Policies

- Formato: "Users can [action] own [resource]"
- Exemplo: "Users can view own expenses"

## 🚨 Troubleshooting

### Erro: "relation already exists"

**Causa**: Migration já foi executada

**Solução**: Ignore ou use `DROP TABLE IF EXISTS` antes

### Erro: "policy already exists"

**Causa**: Policies já foram criadas

**Solução**: As migrations usam `DROP POLICY IF EXISTS`, execute novamente

### Tabelas não aparecem

**Causa**: Migrations não foram executadas

**Solução**:
```bash
supabase db push
```

### RLS bloqueando acesso

**Causa**: Usuário não está autenticado ou policies incorretas

**Solução**:
1. Verifique se o usuário está logado
2. Confirme que as policies foram criadas
3. Teste com `auth.uid()` no SQL Editor

## 📚 Recursos

- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)

## 🎯 Próximos Passos

Depois de executar as migrations:

1. ✅ Verifique as tabelas no Table Editor
2. ✅ Confirme as policies em cada tabela
3. ✅ Execute `npm run verificar-supabase`
4. ✅ Teste a aplicação criando um usuário
5. ✅ Adicione dados de teste

## 💡 Dicas

1. Use `00_complete_setup.sql` para novos projetos
2. Use migrations incrementais (01, 02, 03) para projetos existentes
3. Sempre teste localmente antes de aplicar em produção
4. Faça backup antes de modificar o schema em produção
5. Use `IF NOT EXISTS` para migrations idempotentes

---

**Precisa de ajuda?** Consulte o [GUIA_SUPABASE.md](../GUIA_SUPABASE.md) na raiz do projeto.
