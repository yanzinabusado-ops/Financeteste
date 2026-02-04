# Documentação da API REST

## Visão Geral

A aplicação FinanceControl utiliza o Supabase como backend, que fornece automaticamente uma API RESTful completa baseada no schema do banco de dados PostgreSQL.

## Base URL

```
https://qyqvjrqnkcfbnkxhnltd.supabase.co
```

## Autenticação

Todas as requisições protegidas requerem um token JWT no header:

```
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}
```

## Endpoints

### Autenticação

#### Cadastrar Usuário
```
POST /auth/v1/signup
Content-Type: application/json

Body:
{
  "email": "usuario@example.com",
  "password": "senha123"
}

Response 200:
{
  "access_token": "jwt_token...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    ...
  }
}
```

#### Login
```
POST /auth/v1/token?grant_type=password
Content-Type: application/json

Body:
{
  "email": "usuario@example.com",
  "password": "senha123"
}

Response 200:
{
  "access_token": "jwt_token...",
  "user": {
    "id": "uuid",
    "email": "usuario@example.com",
    ...
  }
}
```

#### Logout
```
POST /auth/v1/logout
Authorization: Bearer {JWT_TOKEN}

Response 204: No Content
```

### Renda (Income)

#### Listar Renda do Usuário
```
GET /rest/v1/income?user_id=eq.{user_id}&month_year=eq.2024-01
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}

Response 200:
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "amount": 5000.00,
    "month_year": "2024-01",
    "description": "Salário",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Criar Renda
```
POST /rest/v1/income
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}
Content-Type: application/json
Prefer: return=representation

Body:
{
  "user_id": "uuid",
  "amount": 5000.00,
  "month_year": "2024-01",
  "description": "Salário"
}

Response 201:
{
  "id": "uuid",
  "user_id": "uuid",
  "amount": 5000.00,
  "month_year": "2024-01",
  "description": "Salário",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Atualizar Renda
```
PATCH /rest/v1/income?id=eq.{income_id}
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}
Content-Type: application/json
Prefer: return=representation

Body:
{
  "amount": 5500.00,
  "description": "Salário + Bônus"
}

Response 200:
{
  "id": "uuid",
  "user_id": "uuid",
  "amount": 5500.00,
  "month_year": "2024-01",
  "description": "Salário + Bônus",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-15T00:00:00Z"
}
```

#### Deletar Renda
```
DELETE /rest/v1/income?id=eq.{income_id}
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}

Response 204: No Content
```

### Despesas (Expenses)

#### Listar Todas as Despesas do Usuário
```
GET /rest/v1/expenses?user_id=eq.{user_id}&order=date.desc
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}

Response 200:
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "description": "Almoço",
    "amount": 45.00,
    "category": "food",
    "date": "2024-01-15",
    "created_at": "2024-01-15T12:30:00Z",
    "updated_at": "2024-01-15T12:30:00Z"
  },
  ...
]
```

#### Filtrar Despesas por Categoria
```
GET /rest/v1/expenses?user_id=eq.{user_id}&category=eq.food
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}

Response 200:
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "description": "Almoço",
    "amount": 45.00,
    "category": "food",
    "date": "2024-01-15",
    ...
  }
]
```

#### Criar Despesa
```
POST /rest/v1/expenses
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}
Content-Type: application/json
Prefer: return=representation

Body:
{
  "user_id": "uuid",
  "description": "Almoço no restaurante",
  "amount": 45.00,
  "category": "food",
  "date": "2024-01-15"
}

Response 201:
{
  "id": "uuid",
  "user_id": "uuid",
  "description": "Almoço no restaurante",
  "amount": 45.00,
  "category": "food",
  "date": "2024-01-15",
  "created_at": "2024-01-15T12:30:00Z",
  "updated_at": "2024-01-15T12:30:00Z"
}
```

#### Atualizar Despesa
```
PATCH /rest/v1/expenses?id=eq.{expense_id}
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}
Content-Type: application/json
Prefer: return=representation

Body:
{
  "description": "Almoço + Sobremesa",
  "amount": 55.00
}

Response 200:
{
  "id": "uuid",
  "user_id": "uuid",
  "description": "Almoço + Sobremesa",
  "amount": 55.00,
  "category": "food",
  "date": "2024-01-15",
  "created_at": "2024-01-15T12:30:00Z",
  "updated_at": "2024-01-15T14:00:00Z"
}
```

#### Deletar Despesa
```
DELETE /rest/v1/expenses?id=eq.{expense_id}
Authorization: Bearer {JWT_TOKEN}
apikey: {SUPABASE_ANON_KEY}

Response 204: No Content
```

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 OK | Requisição bem-sucedida |
| 201 Created | Recurso criado com sucesso |
| 204 No Content | Operação bem-sucedida sem conteúdo de retorno |
| 400 Bad Request | Erro de validação ou dados inválidos |
| 401 Unauthorized | Token de autenticação ausente ou inválido |
| 403 Forbidden | Acesso negado ao recurso |
| 404 Not Found | Recurso não encontrado |
| 409 Conflict | Conflito de dados (ex: email já cadastrado) |
| 500 Internal Server Error | Erro interno do servidor |

## Categorias de Despesas

Valores válidos para o campo `category`:

- `food` - Alimentação
- `transport` - Transporte
- `entertainment` - Lazer
- `health` - Saúde
- `education` - Educação
- `bills` - Contas
- `shopping` - Compras
- `other` - Outros

## Exemplos de Uso (JavaScript)

### Usando o Supabase Client

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qyqvjrqnkcfbnkxhnltd.supabase.co',
  'your_anon_key'
);

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@example.com',
  password: 'senha123'
});

// Listar despesas
const { data: expenses } = await supabase
  .from('expenses')
  .select('*')
  .eq('user_id', user.id)
  .order('date', { ascending: false });

// Criar despesa
const { data: newExpense } = await supabase
  .from('expenses')
  .insert([{
    user_id: user.id,
    description: 'Almoço',
    amount: 45.00,
    category: 'food',
    date: '2024-01-15'
  }])
  .select()
  .single();

// Atualizar despesa
const { data: updated } = await supabase
  .from('expenses')
  .update({ amount: 50.00 })
  .eq('id', expenseId)
  .select()
  .single();

// Deletar despesa
await supabase
  .from('expenses')
  .delete()
  .eq('id', expenseId);
```

### Usando Fetch API

```javascript
const supabaseUrl = 'https://qyqvjrqnkcfbnkxhnltd.supabase.co';
const token = 'jwt_token...';
const anonKey = 'your_anon_key';

// Listar despesas
const response = await fetch(
  `${supabaseUrl}/rest/v1/expenses?user_id=eq.${userId}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': anonKey,
      'Content-Type': 'application/json'
    }
  }
);
const expenses = await response.json();

// Criar despesa
const response = await fetch(
  `${supabaseUrl}/rest/v1/expenses`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': anonKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      user_id: userId,
      description: 'Almoço',
      amount: 45.00,
      category: 'food',
      date: '2024-01-15'
    })
  }
);
const newExpense = await response.json();
```

## Segurança

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado. As políticas garantem que:

1. Usuários só podem ver seus próprios dados
2. Usuários só podem criar recursos para si mesmos
3. Usuários só podem atualizar seus próprios recursos
4. Usuários só podem deletar seus próprios recursos

### Headers Obrigatórios

Para requisições autenticadas:
- `Authorization: Bearer {JWT_TOKEN}`
- `apikey: {SUPABASE_ANON_KEY}`

### Validações

- Email: deve ser válido
- Senha: mínimo 6 caracteres
- Amount: deve ser numérico e >= 0
- Date: deve ser uma data válida
- Category: deve ser uma das categorias válidas

## Limitações

- Rate limiting: conforme plano Supabase
- Tamanho máximo de payload: 1MB
- Token JWT expira em 1 hora (configurável)

## Suporte

Para mais informações sobre a API do Supabase:
- [Documentação Oficial](https://supabase.com/docs)
- [PostgREST API](https://postgrest.org/)
