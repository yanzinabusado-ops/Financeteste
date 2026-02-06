# ⚡ Deploy Rápido no Vercel

## 🚨 ANTES DE COMEÇAR

### ⚠️ AÇÃO OBRIGATÓRIA: Rotacionar Credenciais

Suas credenciais antigas foram expostas no GitHub. Você DEVE criar novas:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings → API**
4. Clique em **"Reset API keys"** ou **"Generate new keys"**
5. Copie as novas credenciais:
   - **Project URL** (começa com https://...supabase.co)
   - **anon/public key** (começa com eyJ...)

---

## 🚀 Deploy em 5 Minutos

### 1. Acesse o Vercel
👉 https://vercel.com/new

### 2. Importe o Repositório
- Clique em **"Import Git Repository"**
- Selecione: `yanzinabusado-ops/Financeteste`
- Clique em **"Import"**

### 3. Configure as Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

| Nome | Valor |
|------|-------|
| `VITE_SUPABASE_URL` | Cole a URL do Supabase (https://...supabase.co) |
| `VITE_SUPABASE_ANON_KEY` | Cole a chave anônima (eyJ...) |

⚠️ **IMPORTANTE:** Use as credenciais NOVAS que você acabou de gerar!

### 4. Deploy
- Clique em **"Deploy"**
- Aguarde 2-3 minutos
- ✅ Pronto! Você receberá uma URL (ex: `seu-projeto.vercel.app`)

---

## 🔧 Configuração Final no Supabase

Após receber a URL do Vercel:

1. Volte ao Supabase Dashboard
2. Vá em **Authentication → URL Configuration**
3. Configure:
   - **Site URL:** `https://seu-projeto.vercel.app`
   - **Redirect URLs:** Adicione `https://seu-projeto.vercel.app/**`
4. Salve as alterações

---

## ✅ Testar a Aplicação

1. Acesse sua URL do Vercel
2. Clique em **"Criar conta"**
3. Registre um novo usuário
4. Faça login
5. Adicione uma despesa de teste
6. Verifique se tudo funciona

---

## 🐛 Problemas Comuns

### "Missing Supabase environment variables"
- Verifique se você adicionou as variáveis no Vercel
- Certifique-se de que os nomes estão corretos (com VITE_ no início)
- Faça um novo deploy: Vercel → Deployments → ⋯ → Redeploy

### "Failed to fetch" ao fazer login
- Verifique se você configurou a URL do Vercel no Supabase Auth
- Aguarde 1-2 minutos para as configurações propagarem

### Página em branco
- Abra o console do navegador (F12)
- Veja os erros
- Verifique os logs no Vercel: Deployments → View Function Logs

---

## 📱 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Teste todas as funcionalidades
2. ✅ Configure um domínio customizado (opcional)
3. ✅ Ative o Vercel Analytics (opcional)
4. ✅ Configure alertas de erro (opcional)

---

## 🔄 Atualizações Futuras

Toda vez que você fizer `git push`, o Vercel fará deploy automático!

```bash
git add .
git commit -m "Minha atualização"
git push origin main
```

---

## 📞 Links Úteis

- 🌐 Vercel Dashboard: https://vercel.com/dashboard
- 🗄️ Supabase Dashboard: https://supabase.com/dashboard
- 📚 Documentação completa: Veja `DEPLOY.md`
- 🔒 Auditoria de segurança: Veja `SECURITY_AUDIT.md`

---

**Boa sorte com seu deploy! 🚀**
