# 🚀 Guia de Deploy no Vercel

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Conta no [Supabase](https://supabase.com)
3. Projeto configurado no Supabase com as migrations aplicadas

---

## 📋 Passo a Passo

### 1. Preparar Credenciais do Supabase

⚠️ **IMPORTANTE:** Antes de fazer deploy, você DEVE rotacionar suas credenciais antigas!

1. Acesse seu projeto no Supabase: https://supabase.com/dashboard
2. Vá em **Settings → API**
3. Clique em **Reset API keys** (se as credenciais antigas foram expostas)
4. Copie as novas credenciais:
   - `Project URL` (VITE_SUPABASE_URL)
   - `anon/public key` (VITE_SUPABASE_ANON_KEY)

### 2. Aplicar Migrations no Supabase

1. No dashboard do Supabase, vá em **SQL Editor**
2. Execute o arquivo `supabase/migrations/00_complete_setup.sql`
3. Verifique se todas as tabelas foram criadas corretamente

### 3. Deploy no Vercel

#### Opção A: Via Interface Web (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New → Project**
3. Importe seu repositório do GitHub: `yanzinabusado-ops/Financeteste`
4. Configure as variáveis de ambiente:
   - Clique em **Environment Variables**
   - Adicione:
     ```
     VITE_SUPABASE_URL = sua_url_do_supabase
     VITE_SUPABASE_ANON_KEY = sua_chave_anonima
     ```
5. Clique em **Deploy**

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Adicionar variáveis de ambiente
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy para produção
vercel --prod
```

### 4. Configurar Domínio no Supabase

Após o deploy, você receberá uma URL do Vercel (ex: `seu-projeto.vercel.app`)

1. Volte ao Supabase Dashboard
2. Vá em **Authentication → URL Configuration**
3. Adicione sua URL do Vercel em:
   - **Site URL:** `https://seu-projeto.vercel.app`
   - **Redirect URLs:** `https://seu-projeto.vercel.app/**`

### 5. Testar a Aplicação

1. Acesse sua URL do Vercel
2. Teste o registro de novo usuário
3. Teste login/logout
4. Adicione uma despesa
5. Verifique se os dados estão sendo salvos

---

## 🔒 Checklist de Segurança

Antes de fazer deploy, verifique:

- [ ] Credenciais antigas foram rotacionadas
- [ ] Arquivo `.env` não está no repositório
- [ ] `.env` está no `.gitignore`
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] RLS (Row Level Security) habilitado no Supabase
- [ ] URL do Vercel adicionada no Supabase Auth
- [ ] HTTPS habilitado (automático no Vercel)

---

## 🛠️ Comandos Úteis

```bash
# Build local para testar
npm run build
npm run preview

# Verificar erros de tipo
npm run typecheck

# Executar testes
npm test

# Ver logs do Vercel
vercel logs
```

---

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se as variáveis de ambiente estão configuradas no Vercel
- Certifique-se de que os nomes estão corretos (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)

### Erro: "Failed to fetch" ao fazer login
- Verifique se a URL do Vercel está configurada no Supabase Auth
- Verifique se o CORS está configurado corretamente

### Página em branco após deploy
- Verifique os logs no Vercel: `vercel logs`
- Verifique o console do navegador (F12)
- Certifique-se de que o build foi bem-sucedido

### Erro 401 ao acessar dados
- Verifique se as policies RLS estão configuradas corretamente
- Verifique se o usuário está autenticado

---

## 📊 Monitoramento

Após o deploy, monitore:

1. **Vercel Analytics:** Dashboard do Vercel
2. **Supabase Logs:** Dashboard do Supabase → Logs
3. **Erros:** Vercel → Project → Logs

---

## 🔄 Atualizações Futuras

Para atualizar a aplicação:

```bash
# Fazer alterações no código
git add .
git commit -m "Descrição das alterações"
git push origin main
```

O Vercel fará deploy automático a cada push na branch `main`.

---

## 📞 Suporte

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vite](https://vitejs.dev)
