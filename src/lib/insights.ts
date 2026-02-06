import type { Expense } from '../types/database';

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  icon: string;
  label: string;
  color: string;
}

export interface FinancialInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  icon: string;
}

export interface TopExpense {
  description: string;
  amount: number;
  category: string;
  date: string;
  percentage: number;
}

const CATEGORY_CONFIG = {
  food: { label: 'Alimentação', icon: '🍔', color: '#FF6B6B' },
  transport: { label: 'Transporte', icon: '🚗', color: '#4ECDC4' },
  entertainment: { label: 'Lazer', icon: '🎬', color: '#FFE66D' },
  health: { label: 'Saúde', icon: '💊', color: '#95E1D3' },
  education: { label: 'Educação', icon: '📚', color: '#A8E6CF' },
  bills: { label: 'Contas', icon: '💡', color: '#FF8B94' },
  shopping: { label: 'Compras', icon: '🛍️', color: '#C7CEEA' },
  other: { label: 'Outros', icon: '📦', color: '#B4A7D6' },
};

// Mapeamento de nomes de categorias em inglês para português
const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'food': 'Alimentação',
  'transport': 'Transporte',
  'entertainment': 'Lazer',
  'health': 'Saúde',
  'education': 'Educação',
  'bills': 'Contas',
  'shopping': 'Compras',
  'other': 'Outros',
};

export function getCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  if (totalExpenses === 0) {
    return [];
  }

  const categoryMap = new Map<string, number>();

  expenses.forEach((expense) => {
    const current = categoryMap.get(expense.category) || 0;
    categoryMap.set(expense.category, current + Number(expense.amount));
  });

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => {
      const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
      return {
        category,
        amount,
        percentage: (amount / totalExpenses) * 100,
        icon: config.icon,
        label: config.label,
        color: config.color,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function getTopExpenses(expenses: Expense[], limit: number = 3): TopExpense[] {
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  return expenses
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, limit)
    .map((expense) => ({
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      date: expense.date,
      percentage: totalExpenses > 0 ? (Number(expense.amount) / totalExpenses) * 100 : 0,
    }));
}

export function generateInsights(
  income: number,
  expenses: Expense[],
  previousMonthExpenses: Expense[] | null = null
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const expensePercentage = income > 0 ? (totalExpenses / income) * 100 : 0;

  // Verificar se há despesa muito alta (>15% da renda em uma única despesa)
  const highExpenses = expenses.filter((exp) => income > 0 && Number(exp.amount) > income * 0.15);
  if (highExpenses.length > 0) {
    highExpenses.forEach((exp) => {
      const percentage = income > 0 ? (Number(exp.amount) / income) * 100 : 0;
      insights.push({
        type: 'warning',
        title: 'Despesa Significativa',
        message: `"${exp.description}" representa ${percentage.toFixed(1)}% da sua renda mensal.`,
        icon: '⚠️',
      });
    });
  }

  // Verificar categorias que excedem 30% da renda
  const categoryBreakdown = getCategoryBreakdown(expenses);
  categoryBreakdown.forEach((category) => {
    const categoryPercentage = income > 0 ? (category.amount / income) * 100 : 0;
    if (categoryPercentage > 30) {
      insights.push({
        type: 'warning',
        title: 'Categoria Elevada',
        message: `Gastos com ${category.label.toLowerCase()} ultrapassaram 30% da sua renda (${categoryPercentage.toFixed(1)}%).`,
        icon: '⚠️',
      });
    }
  });

  // Verificar se gastos totais ultrapassam 80% da renda
  if (expensePercentage > 80) {
    insights.push({
      type: 'warning',
      title: 'Atenção com Orçamento',
      message: `Seus gastos atingiram ${expensePercentage.toFixed(1)}% da sua renda. Considere reduzir despesas.`,
      icon: '⚠️',
    });
  } else if (expensePercentage > 60) {
    insights.push({
      type: 'info',
      title: 'Gastos Moderados',
      message: `Você gastou ${expensePercentage.toFixed(1)}% da sua renda. Mantenha o bom trabalho!`,
      icon: '💡',
    });
  } else if (totalExpenses > 0) {
    insights.push({
      type: 'success',
      title: 'Excelente Controle',
      message: `Você gastou apenas ${expensePercentage.toFixed(1)}% da sua renda. Parabéns!`,
      icon: '✅',
    });
  }

  // Comparar com mês anterior
  if (previousMonthExpenses && previousMonthExpenses.length > 0) {
    const previousTotal = previousMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const difference = totalExpenses - previousTotal;
    const percentageDifference = previousTotal > 0 ? (difference / previousTotal) * 100 : 0;

    if (Math.abs(difference) > 0.01) {
      if (difference > 0) {
        insights.push({
          type: 'warning',
          title: 'Gastos Aumentaram',
          message: `Você gastou ${Math.abs(percentageDifference).toFixed(1)}% a mais que no mês anterior.`,
          icon: '📈',
        });
      } else {
        insights.push({
          type: 'success',
          title: 'Gastos Diminuíram',
          message: `Você gastou ${Math.abs(percentageDifference).toFixed(1)}% a menos que no mês anterior!`,
          icon: '📉',
        });
      }
    }
  }

  return insights;
}

export function getCurrentMonthYear(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getPreviousMonthYear(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}

export function getCategoryColor(category: string): string {
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
  return config.color;
}

export function getCategoryLabel(category: string): string {
  // Primeiro tenta traduzir se for inglês
  const translated = CATEGORY_TRANSLATIONS[category.toLowerCase()];
  if (translated) return translated;
  
  // Senão, usa a config normal
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
  return config.label;
}

export function getCategoryIcon(category: string): string {
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
  return config.icon;
}
