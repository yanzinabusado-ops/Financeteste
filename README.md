# FinanceControl - Controle Financeiro Pessoal

Uma aplicação web moderna e animada para controle financeiro pessoal, construída com React, TypeScript, Tailwind CSS e Supabase.

## Funcionalidades

### Autenticação
- Cadastro de usuários com email e senha
- Login seguro com JWT
- Proteção de rotas privadas
- Logout seguro

### Gestão Financeira
- **Renda Mensal**: Cadastre e gerencie sua renda mensal
- **Despesas**:
  - Adicione despesas com descrição, valor, categoria e data
  - Edite despesas existentes
  - Exclua despesas
  - Filtre por categoria
  - 8 categorias disponíveis: Alimentação, Transporte, Lazer, Saúde, Educação, Contas, Compras e Outros

### Dashboard
- Visualização clara da renda mensal
- Total de gastos
- Saldo restante (renda - gastos)
- Cards informativos com animações
- Interface responsiva e moderna

## Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos
- **Vite** - Build tool rápido

### Backend e Banco de Dados
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - RESTful API automática

## Arquitetura REST

A aplicação segue os princípios REST/RESTful:

### Endpoints Supabase (gerados automaticamente)

#### Autenticação
- `POST /auth/v1/signup` - Cadastro de usuário
- `POST /auth/v1/token?grant_type=password` - Login
- `POST /auth/v1/logout` - Logout

#### Recursos (protegidos por autenticação)

**Renda (income)**
- `GET /rest/v1/income` - Listar renda do usuário
- `POST /rest/v1/income` - Criar renda
- `PATCH /rest/v1/income?id=eq.{id}` - Atualizar renda
- `DELETE /rest/v1/income?id=eq.{id}` - Deletar renda

**Despesas (expenses)**
- `GET /rest/v1/expenses` - Listar despesas
- `POST /rest/v1/expenses` - Criar despesa
- `PATCH /rest/v1/expenses?id=eq.{id}` - Atualizar despesa
- `DELETE /rest/v1/expenses?id=eq.{id}` - Deletar despesa

### Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- Usuários só acessam seus próprios dados
- Policies de segurança para SELECT, INSERT, UPDATE e DELETE
- JWT para autenticação de requisições

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── AuthPage.tsx    # Página de autenticação
│   ├── Login.tsx       # Componente de login
│   ├── Register.tsx    # Componente de cadastro
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── SummaryCards.tsx # Cards de resumo financeiro
│   ├── IncomeCard.tsx  # Gerenciamento de renda
│   ├── AddExpense.tsx  # Adicionar despesa
│   ├── ExpensesList.tsx # Lista de despesas
│   └── ExpenseItem.tsx # Item individual de despesa
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Contexto de autenticação
├── lib/               # Bibliotecas e configurações
│   └── supabase.ts    # Cliente Supabase
├── types/             # Tipos TypeScript
│   └── database.ts    # Tipos do banco de dados
├── App.tsx            # Componente principal
├── main.tsx           # Entry point
└── index.css          # Estilos globais e animações
```

## Schema do Banco de Dados

### Tabela: income
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> auth.users)
- amount (numeric)
- month_year (text)
- description (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### Tabela: expenses
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> auth.users)
- description (text)
- amount (numeric)
- category (text)
- date (date)
- created_at (timestamptz)
- updated_at (timestamptz)
```

## Animações e UX

- Transições suaves em todos os elementos interativos
- Hover effects em cards e botões
- Animações de entrada (slide, fade)
- Feedback visual para ações (loading states)
- Gradientes modernos
- Scrollbar customizada
- Interface responsiva

## Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase (gratuita)

### Instalação

1. Clone o repositório

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
O arquivo `.env` já está configurado com as credenciais do Supabase.

4. Rode a aplicação:
```bash
npm run dev
```

5. Acesse no navegador:
```
http://localhost:5173
```

### Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão na pasta `dist/`.

## Recursos de Segurança

1. **Senhas**: Criptografadas com bcrypt pelo Supabase
2. **JWT**: Tokens seguros para autenticação
3. **RLS**: Políticas de segurança no nível do banco
4. **Validação**: Validação de dados no frontend e backend
5. **HTTPS**: Todas as requisições via HTTPS

## Status HTTP Utilizados

- `200 OK` - Requisição bem-sucedida
- `201 Created` - Recurso criado com sucesso
- `400 Bad Request` - Erro de validação
- `401 Unauthorized` - Não autenticado
- `404 Not Found` - Recurso não encontrado
- `500 Internal Server Error` - Erro no servidor

## Melhorias Futuras

- Gráficos e relatórios visuais
- Exportação de dados (PDF, Excel)
- Metas financeiras
- Notificações de gastos
- Modo escuro
- Multi-moedas
- Categorias personalizadas

## Licença

MIT License - Sinta-se livre para usar e modificar!
