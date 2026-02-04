# Guia de Inteligência Financeira do FinanceControl

## Visão Geral

O FinanceControl incorpora inteligência financeira através de regras de negócio simples e claras. O sistema analisa os gastos do usuário em tempo real e fornece insights automáticos para auxiliar na tomada de decisões financeiras.

## Arquitetura da Inteligência

### Componentes Principais

```
Dashboard.tsx (Orquestrador)
  ├── FinancialInsights.tsx (Insights automáticos)
  ├── ExpensesChart.tsx (Visualização de categorias)
  └── TopExpenses.tsx (Ranking de despesas)
       └── lib/insights.ts (Motor de análise)
```

## Regras de Negócio

### Regra 1: Despesa Significativa Individual

**Condição:** Uma despesa > 15% da renda mensal

**Ação:** Exibir alerta de warning

**Exemplo:**
- Renda: R$ 1.000
- Limite: R$ 150 (15%)
- Despesa adicionada: R$ 200
- **Resultado:** ⚠️ "Essa despesa representa 20% da sua renda mensal"

**Código:**
```typescript
const highExpenses = expenses.filter((exp) =>
  income > 0 && Number(exp.amount) > income * 0.15
);
```

### Regra 2: Categoria Crítica

**Condição:** Uma categoria > 30% da renda mensal

**Ação:** Exibir alerta de warning por categoria

**Exemplo:**
- Renda: R$ 1.000
- Limite para Alimentação: R$ 300 (30%)
- Gastos em Alimentação: R$ 350
- **Resultado:** ⚠️ "Gastos com alimentação ultrapassaram 30% da sua renda (35%)"

**Código:**
```typescript
categoryBreakdown.forEach((category) => {
  const categoryPercentage = income > 0 ?
    (category.amount / income) * 100 : 0;
  if (categoryPercentage > 30) {
    // Adiciona insight
  }
});
```

### Regra 3: Orçamento em Risco

**Condição:** Gastos totais > 80% da renda

**Ação:** Exibir alerta crítico

**Exemplo:**
- Renda: R$ 1.000
- Gastos: R$ 820
- Percentual: 82%
- **Resultado:** ⚠️ "Seus gastos atingiram 82% da sua renda"

**Código:**
```typescript
const expensePercentage = income > 0 ?
  (totalExpenses / income) * 100 : 0;
if (expensePercentage > 80) {
  // Alerta crítico
}
```

### Regra 4: Controle Bom

**Condição:** Gastos entre 60% e 80% da renda

**Ação:** Exibir mensagem de info

**Resultado:** 💡 "Você gastou 75% da sua renda. Mantenha o bom trabalho!"

**Código:**
```typescript
else if (expensePercentage > 60) {
  insights.push({
    type: 'info',
    title: 'Gastos Moderados',
    message: `Você gastou ${expensePercentage.toFixed(1)}% da sua renda...`
  });
}
```

### Regra 5: Controle Excelente

**Condição:** Gastos < 60% da renda

**Ação:** Exibir mensagem de sucesso

**Resultado:** ✅ "Você gastou apenas 50% da sua renda. Parabéns!"

**Código:**
```typescript
else if (totalExpenses > 0) {
  insights.push({
    type: 'success',
    title: 'Excelente Controle',
    message: `Você gastou apenas ${expensePercentage.toFixed(1)}% da sua renda...`
  });
}
```

### Regra 6: Comparação com Mês Anterior

**Condição:** Dados disponíveis do mês anterior

**Ação:** Comparar gastos e exibir tendência

**Exemplo:**
- Mês Anterior: R$ 900
- Mês Atual: R$ 950
- Diferença: +50 (+5.5%)
- **Resultado:** 📈 "Você gastou 5.5% a mais que no mês anterior"

**Código:**
```typescript
if (previousMonthExpenses && previousMonthExpenses.length > 0) {
  const previousTotal = previousMonthExpenses.reduce(...);
  const difference = totalExpenses - previousTotal;
  const percentageDifference = previousTotal > 0 ?
    (difference / previousTotal) * 100 : 0;

  if (difference > 0) {
    // Alerta de aumento
  } else {
    // Celebra redução
  }
}
```

## Fluxo de Processamento

### 1. Usuário Adiciona Despesa

```
Usuário clica "Adicionar Despesa"
    ↓
Valida dados (descrição, valor, categoria)
    ↓
Envia POST para Supabase
    ↓
Supabase retorna despesa criada
    ↓
Dashboard recebe despesa
    ↓
Dashboard chama setExpenses([nova_despesa, ...expenses])
```

### 2. Insights Recalculados Automaticamente

```
useEffect detecta mudança em expenses ou income
    ↓
FinancialInsights.loadInsights() é chamado
    ↓
Busca despesas do mês anterior (SQL)
    ↓
Chama generateInsights(income, expenses, previousExpenses)
    ↓
Retorna array de insights
    ↓
Renders componente com insights atualizados
```

### 3. Gráfico Atualizado

```
useEffect detecta mudança em expenses
    ↓
ExpensesChart chama getCategoryBreakdown(expenses)
    ↓
Calcula total por categoria
    ↓
Atualiza dados do Chart.js
    ↓
Gráfico re-renderiza com animação suave
```

## Exemplos Práticos

### Exemplo 1: Gastar Demais em Uma Categoria

**Cenário:**
- Renda: R$ 3.000
- Despesas em Alimentação: R$ 1.200 (40%)
- Limite da categoria: 30%

**Insights Exibidos:**
1. ⚠️ "Gastos com alimentação ultrapassaram 30% da sua renda (40%)"

**Ação Esperada:**
- Usuário reduz despesas com alimentação
- Volta para ~30% e insight desaparece

### Exemplo 2: Despesa Inesperada Alta

**Cenário:**
- Renda: R$ 2.000
- Usuário adiciona despesa: R$ 500 (Conserto de carro)
- 500 > 2000 * 0.15 (300)

**Insights Exibidos:**
1. ⚠️ "Essa despesa representa 25% da sua renda mensal"
2. ⚠️ "Gastos atingiram 65% da sua renda"

**Visualização:**
- Despesa aparece no ranking das 3 maiores
- Gráfico atualiza com nova categoria/valor

### Exemplo 3: Mês Controlado vs Mês Anterior

**Cenário Mês 1 (Referência):**
- Gastos: R$ 1.500

**Cenário Mês 2 (Atual):**
- Gastos: R$ 1.200
- Redução: 20%

**Insights Exibidos:**
1. ✅ "Você gastou 20% a menos que no mês anterior!"
2. ✅ "Excelente Controle - 60% da sua renda"

### Exemplo 4: Usuário Sem Renda Configurada

**Cenário:**
- Renda: R$ 0
- Despesas: R$ 100

**Comportamento:**
- Nenhum insight exibido (validação: `if (income === 0)`)
- Gráfico mostra categorias normalmente
- TopExpenses mostra despesas normalmente
- Usuário é incentivado a configurar renda

## Customização de Regras

### Para Modificar Limites

Edite `src/lib/insights.ts`:

```typescript
// Mudar limite de despesa significativa de 15% para 20%
const highExpenses = expenses.filter((exp) =>
  income > 0 && Number(exp.amount) > income * 0.20  // Era 0.15
);

// Mudar limite de categoria de 30% para 25%
if (categoryPercentage > 25) {  // Era 30
  // Alerta
}

// Mudar limite crítico de 80% para 75%
if (expensePercentage > 75) {  // Era 80
  // Alerta crítico
}
```

### Para Adicionar Novas Categorias

```typescript
// 1. Adicione à CATEGORY_CONFIG
const CATEGORY_CONFIG = {
  // ... existentes
  subscriptions: {
    label: 'Assinaturas',
    icon: '🔔',
    color: '#FF6B9D'
  },
};

// 2. Banco de dados já suporta qualquer string em 'category'
// 3. Atualize opciones do select em AddExpense.tsx
```

### Para Adicionar Nova Regra de Insight

```typescript
// Em src/lib/insights.ts, na função generateInsights()

// Exemplo: Alerta se falta menos de 3 dias para o mês terminar
const daysLeft = getDaysLeftInMonth();
if (daysLeft < 3 && balance < totalExpenses * 0.1) {
  insights.push({
    type: 'warning',
    title: 'Mês Terminando',
    message: `Faltam ${daysLeft} dias e seu saldo está apertado.`,
    icon: '⏰'
  });
}
```

## Performance

### Otimizações Implementadas

1. **Cálculos memoizados:** `getCategoryBreakdown()` é pura
2. **Queries otimizadas:** Fetch do mês anterior usa índices
3. **Lazy loading:** Gráfico renderiza após dados carregarem
4. **Sem re-renders desnecessários:** useEffect bem configurado

### Limites

- Máximo 1000 despesas por rendição recomendado
- Comparação com 1 mês anterior (não histórico completo)

## Segurança

### Proteções

1. **Entrada validada:** Números validados antes de cálculos
2. **Divisão por zero:** Verificação `income > 0`
3. **Dados do usuário:** Filtrados por `user_id` no Supabase
4. **RLS:** Row Level Security previne acesso cruzado

## Testes

### Teste Manual: Cenário Completo

1. Crie nova conta
2. Configure renda de R$ 2.000
3. Adicione despesa de R$ 500 (Alimentação)
   - Esperado: Sem insights (25% OK)
4. Adicione despesa de R$ 800 (Alimentação)
   - Esperado: ⚠️ Alimentação > 30% (65%)
5. Adicione despesa de R$ 600 (Saúde) - Despesa significativa
   - Esperado: ⚠️ Despesa de 30% + ⚠️ Orçamento crítico
6. Delete a despesa de R$ 600
   - Esperado: Insights atualizarem, voltando ao estado anterior
7. Volte mês anterior e adicione R$ 2.000 em despesas
8. Volte para mês atual
   - Esperado: 📉 "Você gastou 58% a menos que no mês anterior"

## Resolução de Problemas

### Insights não aparecem

**Verificar:**
- Renda configurada? (income > 0)
- Tem despesas? (expenses.length > 0)
- Console aberta (F12) - tem erros?

### Gráfico não renderiza

**Verificar:**
- Chart.js instalado? (`npm list chart.js`)
- Tem despesas? (vazio mostra mensagem)
- Valores válidos? (não-negativo)

### Comparação com mês anterior não funciona

**Verificar:**
- Tem dados do mês anterior?
- Query está correta? (gte/lt dates)
- User_id está correto?

## Roadmap de Inteligência

### V2 (próxima)
- [ ] Metas por categoria
- [ ] Alertas customizáveis por usuário
- [ ] Previsões baseadas em histórico

### V3
- [ ] Machine learning para categorização automática
- [ ] Recomendações personalizadas de economia
- [ ] Integração com orçamento anual

### V4
- [ ] APIs de bancos para dados automáticos
- [ ] Análise de hábitos de gasto
- [ ] Comparação com benchmark (média de usuários)

## Referências

- [Princípios de Engenharia Financeira Pessoal](https://en.wikipedia.org/wiki/Personal_finance)
- [Regra 50/30/20 de Orçamento](https://www.investopedia.com/terms/f/50-30-20_rule.asp)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
