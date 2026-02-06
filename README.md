# FinanceControl

Sistema inteligente de controle financeiro pessoal com análise de dados e insights automáticos.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React

## ✨ Funcionalidades

- 📊 Dashboard com visão geral financeira
- 💰 Gestão de receitas e despesas
- 📈 Gráficos interativos de gastos por categoria
- 🎯 Sistema de orçamentos com alertas
- 🔍 Insights financeiros automáticos
- 📱 Interface responsiva
- 🔐 Autenticação segura com Supabase
- 🌙 Análise de comportamento de gastos

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- Conta no Supabase (gratuita)

### Passo 1: Clone o repositório

```bash
git clone <seu-repositorio>
cd FinanceControl
```

### Passo 2: Instale as dependências

```bash
npm install
```

### Passo 3: Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute as migrations em `supabase/migrations/` no SQL Editor
3. Copie as credenciais do projeto

### Passo 4: Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Passo 5: Execute o projeto

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 📁 Estrutura do Projeto

```
FinanceControl/
├── src/
│   ├── components/      # Componentes React
│   ├── contexts/        # Context API (Auth)
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários e configurações
│   └── types/          # TypeScript types
├── supabase/
│   └── migrations/     # SQL migrations
└── public/            # Assets estáticos
```

## 🔒 Segurança

- ✅ Row Level Security (RLS) habilitado em todas as tabelas
- ✅ Autenticação JWT via Supabase com PKCE flow
- ✅ Validação e sanitização de inputs no frontend
- ✅ Content Security Policy (CSP) configurado
- ✅ Headers de segurança (HSTS, X-Frame-Options, etc.)
- ✅ Rate limiting no cliente
- ✅ Políticas de acesso isoladas por usuário
- ⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` com credenciais reais

### Auditoria de Segurança

Execute a auditoria de segurança:
```bash
npm audit
```

Veja o relatório completo em `SECURITY_AUDIT.md`

## 🧪 Testes

```bash
npm run test
```

## 📦 Build

```bash
npm run build
```

## 🚀 Deploy

Para fazer deploy no Vercel, siga o guia completo em `DEPLOY.md`

Resumo rápido:
1. Rotacione suas credenciais do Supabase (se foram expostas)
2. Configure as variáveis de ambiente no Vercel
3. Conecte seu repositório GitHub ao Vercel
4. Deploy automático a cada push

```bash
# Via CLI
npm i -g vercel
vercel login
vercel
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run test` - Executa testes
- `npm run lint` - Verifica código com ESLint

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👤 Autor

Desenvolvido com ❤️ para ajudar no controle financeiro pessoal.
