# Exemplos de Uso - FinanceControl com Inteligência Financeira

## Cenário 1: Novo Usuário - Primeira Semana

### Dia 1: Configuração Inicial

```
1. Usuário cria conta
   Email: joao@example.com
   Senha: senha_segura_123

2. Faz login
   Redirecionado para Dashboard

3. Configura renda mensal
   Valor: R$ 3.000
   Descrição: Salário

4. Dashboard mostra:
   - Summary Cards:
     Income: R$ 3.000
     Expenses: R$ 0
     Balance: R$ 3.000
   - Insights do Mês: (vazio, sem despesas)
   - Gráfico: (vazio, sem despesas)
   - Top Expenses: (vazio, sem despesas)
```

### Dia 2: Primeira Despesa

```
1. Usuário adiciona despesa
   Descrição: "Almoço no trabalho"
   Valor: R$ 45
   Categoria: Alimentação
   Data: 01/02/2024

2. Dashboard atualiza:
   - Summary Cards:
     Income: R$ 3.000
     Expenses: R$ 45
     Balance: R$ 2.955
   - Insights: (nenhum alerta, 1.5% é seguro)
   - Gráfico: Mostra apenas Alimentação (100%)
   - Top Expenses: Mostra despesa com 🥇

3. Componente ExpensesChart:
   - Animação fade-in suave
   - Legenda: 🍔 Alimentação: R$ 45 (100%)
   - Tabela: Barra de progresso 100% preenchida
```

### Dia 5: Múltiplas Despesas

```
1. Usuário adiciona 4 mais despesas:
   - R$ 50 Alimentação
   - R$ 80 Transporte
   - R$ 30 Lazer
   - R$ 40 Saúde

2. Total: R$ 245 (8.2% da renda)

3. Dashboard:
   - Summary Cards: R$ 245 em despesas
   - Insights: ✅ "Excelente Controle - 8.2% da sua renda"
   - Gráfico mostra:
     🍔 Alimentação: R$ 95 (38.8%)
     🚗 Transporte: R$ 80 (32.7%)
     🎬 Lazer: R$ 30 (12.2%)
     💊 Saúde: R$ 40 (16.3%)
   - Top Expenses:
     🥇 Transporte - R$ 80 (32.7%)
     🥈 Alimentação - R$ 95 (38.8%) ← agora em 2º?
     🥉 Saúde - R$ 40 (16.3%)
```

## Cenário 2: Usuário Experiente - Mês Crítico

### Situation: Gastos Elevados

```
Renda: R$ 5.000

Despesas acumuladas:
- Alimentação: R$ 1.800 (36% - ALERTA!)
- Transporte: R$ 900 (18%)
- Saúde: R$ 1.200 (24%)
- Contas: R$ 1.500 (30% - ALERTA!)
- Educação: R$ 400 (8%)
- Total: R$ 5.800 (116% - CRÍTICO!)

Dashboard mostra:
────────────────────────────────────────

SUMMARY CARDS:
Income: R$ 5.000 | Expenses: R$ 5.800 | Balance: -R$ 800

INSIGHTS DO MÊS:
⚠️ Categoria Elevada
"Gastos com alimentação ultrapassaram 30% da sua renda (36%)"

⚠️ Categoria Elevada
"Gastos com contas ultrapassaram 30% da sua renda (30%)"

⚠️ Atenção com Orçamento
"Seus gastos atingiram 116% da sua renda. Reduza despesas."

GRÁFICO (Pie Chart):
[Gráfico com cores diferentes, cada categoria com seu percentual]

TOP EXPENSES:
🥇 Alimentação - R$ 1.800 (31%)
🥈 Contas - R$ 1.500 (26%)
🥉 Saúde - R$ 1.200 (21%)
```

### Ação do Usuário: Editar Despesa Alta

```
1. Usuário localiza "Almoço gourmet" - R$ 280
   (Ultrapassa 15% de R$ 5.000 = R$ 750?)
   Não, está OK em termos individuais

2. Mas observa que alimentação está muito alta

3. Clica editar em "Compras de supermercado" - R$ 600
   Muda para: R$ 300
   Salva

4. Dashboard atualiza em tempo real:
   - Alimentação: R$ 1.200 (24%)
   - Alerta desaparece ✅
   - Total: R$ 5.500 (110%) - ainda crítico mas melhor
   - Top Expenses atualiza com novas posições
```

## Cenário 3: Comparação com Mês Anterior

### Janeiro: Mês de Gastos

```
JANEIRO 2024
Renda: R$ 4.000
Despesas:
- Alimentação: R$ 1.200
- Transporte: R$ 600
- Lazer: R$ 400
- Contas: R$ 800
- Saúde: R$ 200
Total: R$ 3.200 (80%)

Dashboard Insights:
⚠️ Orçamento em Atenção
"Seus gastos atingiram 80% da sua renda"

📉 Gastos Aumentaram
"Você gastou 25% a mais que em dezembro"
(Baseline dezembro: R$ 2.560)
```

### Fevereiro: Mês Controlado

```
FEVEREIRO 2024
Renda: R$ 4.000
Despesas:
- Alimentação: R$ 900
- Transporte: R$ 500
- Lazer: R$ 250
- Contas: R$ 800
- Saúde: R$ 150
Total: R$ 2.600 (65%)

Dashboard Insights:
💡 Gastos Moderados
"Você gastou 65% da sua renda. Mantenha o bom trabalho!"

📈 Gastos Diminuíram ✅
"Você gastou 18.75% a menos que em janeiro!"
[Cálculo: (3200-2600)/3200 = 18.75%]
```

## Cenário 4: Despesa Inesperada e Significativa

### Evento: Reparo de Carro

```
Contexto:
Renda: R$ 2.500
Gastos atuais: R$ 1.200
Limite crítico: R$ 375 (15%)

Ação: Usuário adiciona despesa
Descrição: "Reparo do cilindro do carro"
Valor: R$ 450
Categoria: Transporte
Data: hoje

VALIDAÇÃO:
450 > 2500 * 0.15 (375)? SIM!
450 > 2500 * 0.30 (750)? NÃO (single, mas múltiplas levam a 30%)

Dashboard ANTES de adicionar:
- Sem alerta

Dashboard DEPOIS de adicionar:
⚠️ Despesa Significativa
"Reparo do cilindro do carro" representa 18% da sua renda mensal

Total de Transporte: R$ 450 (?) + outras
Se total transporte > 30%, novo alerta

Usuário pode decidir:
- Manter a despesa e pagar
- Cancelar e buscar outro orçamento
```

## Cenário 5: Categoria Muito Gastos - Lazer

### Comportamento Detectado

```
Renda: R$ 2.000

Padrão observado:
- 5 de fevereiro: Cinema - R$ 60
- 10 de fevereiro: Show - R$ 150
- 15 de fevereiro: Restaurante - R$ 120
- 20 de fevereiro: Videogame - R$ 80
- 25 de fevereiro: Viagem - R$ 300

Total Lazer: R$ 710 (35.5%)

Dashboard Insights:
⚠️ Categoria Elevada
"Gastos com lazer ultrapassaram 30% da sua renda (35.5%)"

Usuário pode:
1. Reduzir gastos com lazer
2. Aumentar renda registrada
3. Ignorar se está planejado (férias)
```

## Cenário 6: Uso em Mobile

```
Visualização em iPhone:

┌─────────────────────────────┐
│ FinanceControl              │
│ joao@example.com    [Sair]  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ SUMMARY CARDS (stack)        │
│ Renda: R$ 3.000             │
│ Gastos: R$ 800              │
│ Saldo: R$ 2.200             │
└─────────────────────────────┘

┌─────────────────────────────┐
│ INSIGHTS DO MÊS              │
│ ✅ Excelente Controle       │
│    Você gastou 26.7%...     │
└─────────────────────────────┘

┌─────────────────────────────┐
│ RENDA MENSAL                │
│ R$ 3.000                    │
│ Salário                     │
│ [Editar]                    │
└─────────────────────────────┘

┌─────────────────────────────┐
│ + NOVA DESPESA              │
│ [Formulário em modal]       │
└─────────────────────────────┘

┌─────────────────────────────┐
│ DESPESAS RECENTES           │
│ 🍔 Almoço - R$ 45          │
│ 🚗 Gasolina - R$ 80        │
│ [Swipe para editar]        │
└─────────────────────────────┘

[Scroll down]

┌─────────────────────────────┐
│ GASTOS POR CATEGORIA        │
│ [Gráfico em 100% de width]  │
│ Barras de progresso         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ MAIORES DESPESAS            │
│ 🥇 Gasolina - R$ 80 (10%)  │
│ 🥈 Almoço - R$ 45 (5.6%)   │
└─────────────────────────────┘
```

## Cenário 7: Erro Handling

### Usuário tenta adicionar despesa sem renda

```
Contexto:
1. Novo usuário
2. Não configurou renda ainda
3. Tenta adicionar despesa

Comportamento:
- Despesa é criada normalmente
- Sem insights exibidos (income = 0 = seguro)
- Summary Cards mostra:
  Income: R$ 0
  Expenses: R$ 100
  Balance: -R$ 100
- Mensagem: "Configure sua renda para insights"
```

### Usuário tenta deletar todas as despesas

```
1. Dashboard com muitas despesas e insights
2. Usuário deleta todas as despesas uma a uma

Comportamento por Delete:
- Cada delete dispara re-render
- Insights desaparecem conforme limite é atingido
- Gráfico transita suavemente (animação)
- Top Expenses atualiza
- Ao final: "Adicione despesas para ver o gráfico"
```

## Cenário 8: Relatório Semanal (Futuro)

```
FEATURE PROPOSTA: Email com insights da semana

Exemplo de email:
─────────────────────────────
Olá João!

Aqui está seu resumo financeiro da semana:

💡 Destaques:
✅ Você gastou apenas 5% da sua renda
📉 Sua categoria mais cara foi Alimentação (40%)

📊 Comparações:
vs Semana Passada: -10% de gastos
vs Mês Passado: -15% de gastos

🎯 Sugestões:
- Alimentação em níveis normais
- Continue assim!

Acesse: https://financecontrol.app

─────────────────────────────
```

## Teste Interativo Sugerido

1. **Setup:**
   - Crie conta nova
   - Configure renda R$ 2.000

2. **Teste de Gráfico:**
   - Adicione 5 despesas em categorias diferentes
   - Observe gráfico aparecer com animação
   - Verifique se percentuais estão corretos
   - Delete uma e veja gráfico atualizar

3. **Teste de Insights:**
   - Adicione despesa > 15% (R$ 300+)
   - Observe insight aparecer
   - Reduza despesa para < 15%
   - Observe insight desaparecer

4. **Teste de Top Expenses:**
   - Adicione 5+ despesas
   - Identifique as 3 maiores
   - Edite uma para ser maior
   - Verifique reordenação

5. **Teste de Comparação:**
   - Volte um mês no banco de dados (manual)
   - Adicione despesas ao mês anterior
   - Volte para mês atual
   - Verifique insight de comparação

---

## Próximos Passos Sugeridos

Para expandir a inteligência:

1. **Metas por Categoria**
   - Usuário define meta de R$ X por categoria
   - Alert quando atingir 80% da meta

2. **Previsões**
   - Análise de padrão de gastos
   - "Você gastou X em lazer em 3 semanas"

3. **Recomendações**
   - "Você pode economizar em Alimentação"

4. **Integração Bancária**
   - Sincronização automática de gastos
