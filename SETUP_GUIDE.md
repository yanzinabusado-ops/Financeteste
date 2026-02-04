# Guia de Configuração do FinanceControl

Este guia detalha como configurar o projeto do zero, incluindo a criação do banco de dados Supabase e configuração do frontend.

## Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Conta no GitHub (opcional, para deploy)
- Conta no Supabase (gratuita)

## Passo 1: Configurar o Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login ou crie uma conta
4. Clique em "New Project"
5. Preencha:
   - Name: `finance-control`
   - Database Password: escolha uma senha forte
   - Region: escolha a mais próxima de você
6. Clique em "Create new project"
7. Aguarde alguns minutos para o projeto ser provisionado

### 1.2 Obter Credenciais

1. No painel do projeto, vá em "Settings" > "API"
2. Copie as seguintes informações:
   - Project URL (ex: `https://xxxxx.supabase.co`)
   - anon/public key (chave pública)
3. Guarde essas informações, você precisará delas

### 1.3 Criar Tabelas e Configurar Segurança

1. No painel do Supabase, vá em "SQL Editor"
2. Clique em "New query"
3. Cole o seguinte código SQL:

```sql
-- Criar tabela de renda
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  month_year text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de despesas
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

-- Habilitar RLS
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policies para Income
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

-- Policies para Expenses
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

-- Criar indexes
CREATE INDEX IF NOT EXISTS income_user_id_idx ON income(user_id);
CREATE INDEX IF NOT EXISTS income_month_year_idx ON income(month_year);
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
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
```

4. Clique em "Run" para executar
5. Verifique se as tabelas foram criadas em "Table Editor"

### 1.4 Configurar Autenticação

1. Vá em "Authentication" > "Providers"
2. Certifique-se de que "Email" está habilitado
3. Em "Email Auth", configure:
   - Enable Email Confirmations: DESABILITADO (para desenvolvimento)
   - Enable Email Signup: HABILITADO
4. Salve as alterações

## Passo 2: Configurar o Frontend

### 2.1 Clonar ou Criar o Projeto

Se já tem o código:
```bash
cd finance-control
```

Se for criar do zero:
```bash
npm create vite@latest finance-control -- --template react-ts
cd finance-control
```

### 2.2 Instalar Dependências

```bash
npm install @supabase/supabase-js lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2.3 Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

Substitua pelos valores copiados do Supabase.

### 2.4 Configurar Tailwind CSS

Edite `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 2.5 Estrutura de Pastas

Crie a seguinte estrutura:

```
src/
├── components/
├── contexts/
├── lib/
└── types/
```

### 2.6 Copiar Código-Fonte

Copie todos os arquivos fornecidos na estrutura do projeto para as pastas correspondentes.

## Passo 3: Executar o Projeto

### 3.1 Modo Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

### 3.2 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.

### 3.3 Visualizar Build

```bash
npm run preview
```

## Passo 4: Deploy (Opcional)

### Deploy no Vercel

1. Instale a Vercel CLI:
```bash
npm install -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Configure as variáveis de ambiente no painel da Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Deploy no Netlify

1. Instale a Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Faça login:
```bash
netlify login
```

3. Faça o build:
```bash
npm run build
```

4. Deploy:
```bash
netlify deploy --prod --dir=dist
```

5. Configure as variáveis de ambiente no painel do Netlify

## Passo 5: Testar a Aplicação

### 5.1 Criar Conta

1. Acesse a aplicação
2. Clique em "Criar conta"
3. Preencha email e senha (mínimo 6 caracteres)
4. Clique em "Criar Conta"
5. Você será redirecionado automaticamente após o login

### 5.2 Adicionar Renda

1. No dashboard, veja o card "Renda Mensal"
2. Preencha o valor da sua renda mensal
3. Adicione uma descrição (opcional)
4. Clique em "Salvar"

### 5.3 Adicionar Despesas

1. Clique no botão "+" no card "Nova Despesa"
2. Preencha:
   - Descrição (ex: "Almoço")
   - Valor (ex: 45.00)
   - Categoria
   - Data
3. Clique em "Adicionar Despesa"

### 5.4 Gerenciar Despesas

- **Filtrar**: Clique nas categorias para filtrar
- **Editar**: Passe o mouse sobre uma despesa e clique no ícone de lápis
- **Excluir**: Clique no ícone de lixeira e confirme

## Troubleshooting

### Erro: "Invalid JWT"

- Verifique se as credenciais do Supabase estão corretas no `.env`
- Certifique-se de que o servidor foi reiniciado após alterar o `.env`

### Erro: "Failed to fetch"

- Verifique sua conexão com a internet
- Confirme que o projeto Supabase está ativo
- Verifique o CORS no painel do Supabase

### Tabelas não aparecem

- Verifique se o SQL foi executado corretamente
- Confira se RLS está habilitado
- Verifique se as policies foram criadas

### Não consigo criar usuário

- Verifique se "Email Signup" está habilitado
- Confirme que a senha tem pelo menos 6 caracteres
- Verifique os logs no painel do Supabase

## Recursos Adicionais

### Documentação

- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com/docs)
- [Vite](https://vitejs.dev)

### Comunidade

- [Supabase Discord](https://discord.supabase.com)
- [React Community](https://react.dev/community)

## Próximos Passos

Depois de configurar o projeto, você pode:

1. Personalizar as cores e o tema
2. Adicionar mais categorias de despesas
3. Implementar gráficos e relatórios
4. Adicionar metas financeiras
5. Implementar exportação de dados
6. Adicionar notificações
7. Criar um modo escuro

## Suporte

Se encontrar problemas:

1. Verifique o console do navegador para erros
2. Confira os logs do Supabase
3. Revise este guia novamente
4. Consulte a documentação oficial
5. Abra uma issue no repositório do projeto

Boa sorte com seu controle financeiro!
