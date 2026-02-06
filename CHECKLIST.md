# ✅ Checklist de Deploy - FinanceControl

## 🔒 Segurança (ANTES DO DEPLOY)

- [ ] **CRÍTICO:** Rotacionar credenciais do Supabase
  - [ ] Acessar https://supabase.com/dashboard
  - [ ] Settings → API → Reset API keys
  - [ ] Copiar nova URL e ANON_KEY
  
- [x] Arquivo .env removido do histórico do Git
- [x] .env adicionado ao .gitignore
- [x] Content Security Policy melhorado
- [x] Headers de segurança configurados
- [x] Validação de inputs implementada
- [x] Rate limiter criado

---

## 🗄️ Supabase

- [ ] Projeto criado no Supabase
- [ ] Migrations aplicadas:
  - [ ] `00_complete_setup.sql` executado
  - [ ] Tabelas criadas (income, expenses, category_budgets, etc.)
  - [ ] RLS habilitado em todas as tabelas
  - [ ] Policies criadas
- [ ] Credenciais NOVAS copiadas

---

## 🚀 Vercel

- [ ] Conta criada no Vercel
- [ ] Repositório importado
- [ ] Variáveis de ambiente configuradas:
  - [ ] `VITE_SUPABASE_URL` = [sua URL nova]
  - [ ] `VITE_SUPABASE_ANON_KEY` = [sua chave nova]
- [ ] Deploy realizado
- [ ] URL do Vercel recebida

---

## 🔗 Configuração Final

- [ ] URL do Vercel adicionada no Supabase:
  - [ ] Authentication → URL Configuration
  - [ ] Site URL configurada
  - [ ] Redirect URLs configuradas
- [ ] Aguardar 1-2 minutos para propagação

---

## 🧪 Testes

- [ ] Acessar URL do Vercel
- [ ] Criar nova conta
- [ ] Fazer login
- [ ] Adicionar renda
- [ ] Adicionar despesa
- [ ] Verificar gráficos
- [ ] Testar logout
- [ ] Fazer login novamente

---

## 📊 Monitoramento (Opcional)

- [ ] Configurar Vercel Analytics
- [ ] Configurar alertas de erro
- [ ] Verificar logs do Supabase
- [ ] Configurar domínio customizado

---

## 📝 Documentação

- [x] README.md atualizado
- [x] SECURITY_AUDIT.md criado
- [x] DEPLOY.md criado
- [x] VERCEL_QUICKSTART.md criado
- [x] .env.example criado

---

## 🎯 Status Atual

**Projeto pronto para deploy!** ✅

### Arquivos Criados:
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `.env.example` - Exemplo de variáveis
- ✅ `DEPLOY.md` - Guia completo de deploy
- ✅ `VERCEL_QUICKSTART.md` - Guia rápido
- ✅ `SECURITY_AUDIT.md` - Relatório de segurança
- ✅ `src/hooks/useInputValidation.ts` - Validação de inputs
- ✅ `src/lib/rateLimiter.ts` - Rate limiting

### Melhorias Implementadas:
- ✅ CSP sem unsafe-eval
- ✅ Headers de segurança (HSTS, X-Frame-Options, etc.)
- ✅ .env removido do Git
- ✅ Validação e sanitização de inputs
- ✅ Rate limiting no cliente

---

## 🚨 PRÓXIMO PASSO OBRIGATÓRIO

**ANTES DE FAZER DEPLOY:**

1. Acesse o Supabase e gere novas credenciais
2. Guarde as credenciais em local seguro
3. Use essas credenciais no Vercel

**Não use as credenciais antigas que estavam no .env!**

---

## 📞 Precisa de Ajuda?

- 📖 Guia rápido: `VERCEL_QUICKSTART.md`
- 📚 Guia completo: `DEPLOY.md`
- 🔒 Segurança: `SECURITY_AUDIT.md`

**Boa sorte! 🚀**
