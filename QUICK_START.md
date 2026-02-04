# 🚀 Quick Start - FinanceControl v2.0

## ⚡ 5 Minutos para Começar

### 1️⃣ Instale Dependências (se não tiver feito)
```bash
npm install
```

### 2️⃣ Rode o App
```bash
npm run dev
```

### 3️⃣ Abra no Navegador
```
http://localhost:5173
```

### 4️⃣ Crie Conta
- Email: seu_email@example.com
- Senha: qualquer coisa com 6+ caracteres

### 5️⃣ Configure Renda
- Clique no card "Renda Mensal"
- Digite seu salário (ex: R$ 3.000)
- Clique "Salvar"

### 6️⃣ Adicione Despesas
- Clique "+ Nova Despesa"
- Preencha: descrição, valor, categoria, data
- Clique "Adicionar"

### 7️⃣ Veja a Mágica
- Gráfico aparece automaticamente
- Insights são exibidos
- Ranking mostra top 3 despesas

## 🎯 O Que Você Vê Agora

### Novo: Gráfico de Gastos 📊
```
Mostra visual em pizza com:
- Distribuição de gastos por categoria
- Percentuais e valores
- Barras de progresso
- Cores diferentes
```

### Novo: Insights Inteligentes 💡
```
Alertas automáticos:
⚠️ Se gastar demais (vermelhos)
💡 Dicas gerais (azuis)
✅ Celebrações (verdes)
```

### Novo: Top 3 Despesas 🏆
```
Ranking com medalhas:
🥇 Maior despesa
🥈 Segunda
🥉 Terceira
```

## 💡 Exemplos de Alertas

### ⚠️ Você receberá alerta se:
- Adicionar despesa > 15% da renda
- Uma categoria > 30% da renda
- Gastos > 80% da renda

### ✅ Você será celebrado se:
- Gastos < 60% da renda
- Reduziu gastos vs mês anterior

## 🧪 Teste Rápido

1. Configure renda: **R$ 1.000**
2. Adicione despesa: **R$ 200** (Alimentação)
   - Sem alertas (20% é OK)
3. Adicione despesa: **R$ 700** (Transporte)
   - Alerta: "Seus gastos atingiram 90%"
4. Observe:
   - ✅ Gráfico mostra 2 categorias
   - ✅ Top 3 mostra ordenado
   - ✅ Insights aparecem automaticamente

## 📱 No Celular?

Tudo funciona! A interface adapta:
- Cards empilham verticalmente
- Gráfico dimensiona corretamente
- Tudo continua acessível

## ❓ FAQ Rápido

**P: Como adiciono categoria nova?**
A: A categoria é selecionada ao adicionar despesa. Tem 8 categorias padrão.

**P: Como comparo com mês anterior?**
A: Automático! Se tiver dados do mês anterior, o insight mostra comparação.

**P: Os dados estão seguros?**
A: Sim! Protegidos por autenticação + RLS no banco + HTTPS.

**P: Posso editar/deletar despesa?**
A: Sim! Passe o mouse (desktop) ou toque (mobile) e clique ícone.

**P: Os gráficos atualizam em tempo real?**
A: Sim! Ao adicionar/editar/deletar, tudo atualiza instantaneamente.

## 🎨 Personalizações Disponíveis

Mudar cores das categorias:
```
src/lib/insights.ts → CATEGORY_CONFIG
```

Mudar limites de alertas:
```
src/lib/insights.ts → generateInsights()
```

Adicionar mais comparações:
```
src/components/FinancialInsights.tsx → loadInsights()
```

## 🚨 Troubleshooting

### Gráfico não aparece?
→ Adicione pelo menos 1 despesa

### Insights não aparecem?
→ Configure renda (obrigatório)

### Build falha?
→ Delete node_modules e rode `npm install` novamente

### Dados não sincronizam?
→ Recarregue página (F5)

## 📚 Para Aprender Mais

- **[WHATS_NEW.md](./WHATS_NEW.md)** - Detalhes das novas features
- **[INTELLIGENCE_GUIDE.md](./INTELLIGENCE_GUIDE.md)** - Como funciona a inteligência
- **[USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)** - Exemplos reais de uso
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura técnica

## ✅ Checklist de Uso

- [ ] Crie conta
- [ ] Configure renda
- [ ] Adicione 5+ despesas
- [ ] Veja gráfico aparecer
- [ ] Observe insights
- [ ] Verifique ranking
- [ ] Teste no celular
- [ ] Edite uma despesa
- [ ] Delete uma despesa
- [ ] Volte mês anterior
- [ ] Veja comparação

## 🎉 Parabéns!

Você está usando o FinanceControl com **inteligência financeira real**. Agora você pode:

✅ Visualizar seus gastos
✅ Receber alertas automáticos
✅ Comparar com mês anterior
✅ Tomar melhores decisões

**Comece agora e mude sua relação com o dinheiro!**

---

Precisa de ajuda? Consulte a documentação completa nos arquivos *.md ou abra uma issue no repositório.
