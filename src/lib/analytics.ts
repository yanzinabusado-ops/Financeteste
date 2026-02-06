import type { Expense } from '../types/database';

// Core Analytics Interfaces

export interface MonthlyProjection {
  projectedBalance: number;
  averageDailySpending: number;
  remainingDays: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface MonthComparison {
  currentTotal: number;
  previousTotal: number;
  percentageChange: number;
  isIncrease: boolean;
  categoryComparisons: CategoryComparison[];
}

export interface CategoryComparison {
  category: string;
  currentAmount: number;
  previousAmount: number;
  percentageChange: number;
}

export interface BudgetAlert {
  category: string;
  limit: number;
  spent: number;
  percentage: number;
  level: 'warning' | 'critical';
}

export interface BehaviorInsight {
  type: 'recurring' | 'dominant_category' | 'spike' | 'consistent';
  message: string;
  priority: number;
}

// Helper Types

export interface ExpenseAggregation {
  totalAmount: number;
  count: number;
  averageAmount: number;
  categoryBreakdown: Map<string, number>;
  dailyAverage: number;
  weeklyAverage: number;
}

export interface TimePeriod {
  startDate: Date;
  endDate: Date;
  monthYear: string;
  daysInPeriod: number;
  daysElapsed: number;
  daysRemaining: number;
}

export interface BudgetStatus {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'safe' | 'warning' | 'exceeded';
}

// Budget Limit Interface (for database)
export interface CategoryBudget {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  month_year: string;
  created_at: string;
  updated_at: string;
}

// Dismissed Insight Interface (for database)
export interface DismissedInsight {
  id: string;
  user_id: string;
  insight_key: string;
  dismissed_at: string;
  expires_at: string;
}

// Analytics Functions

/**
 * Calculate monthly projection based on current spending rate
 * Formula: current_balance - (avg_daily_spending * remaining_days)
 * Requirements: 1.1, 1.5
 * 
 * Melhorias:
 * - Considera apenas dias úteis do mês até agora
 * - Exclui despesas futuras
 * - Calcula média ponderada dos últimos 7 dias
 */
export function calculateMonthlyProjection(
  expenses: Expense[],
  currentBalance: number,
  currentDate: Date = new Date()
): MonthlyProjection | null {
  // Handle edge case: null or undefined expenses array
  if (!expenses || !Array.isArray(expenses)) {
    return null;
  }

  // Handle edge case: empty expense array
  if (expenses.length === 0) {
    return null;
  }

  // Handle edge case: invalid current balance (null, undefined, or NaN)
  if (currentBalance == null || isNaN(currentBalance)) {
    currentBalance = 0;
  }

  // Handle edge case: invalid current date
  if (!currentDate || isNaN(currentDate.getTime())) {
    currentDate = new Date();
  }

  const timePeriod = getTimePeriod(currentDate);
  
  // Handle edge case: insufficient data (< 3 days)
  if (timePeriod.daysElapsed < 3) {
    return null;
  }

  // Normalizar data atual para início do dia
  const currentDateNormalized = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  // Filter expenses for current month, excluding future dates
  const currentMonthExpenses = expenses.filter(expense => {
    // Handle edge case: missing or null date
    if (!expense || !expense.date) {
      return false;
    }

    // Parse expense date and normalize to start of day in local timezone
    const expenseDateStr = expense.date.split('T')[0]; // Get date part only
    const [year, month, day] = expenseDateStr.split('-').map(Number);
    const expenseDate = new Date(year, month - 1, day); // Create date in local timezone
    
    // Handle edge case: invalid date
    if (isNaN(expenseDate.getTime())) {
      return false;
    }

    // Exclude expenses that are after the current day (tomorrow or later)
    if (expenseDate > currentDateNormalized) {
      return false;
    }

    return expenseDate >= timePeriod.startDate && expenseDate <= timePeriod.endDate;
  });

  // Calculate total spending
  const totalSpending = currentMonthExpenses.reduce((sum, expense) => {
    // Handle edge case: missing or null amount
    const amount = expense?.amount;
    if (amount == null || isNaN(Number(amount))) {
      return sum;
    }
    return sum + Number(amount);
  }, 0);

  // Calcular média diária com peso maior nos últimos 7 dias
  let averageDailySpending = 0;
  
  if (timePeriod.daysElapsed >= 7) {
    // Se temos 7+ dias, usar média ponderada
    const last7DaysDate = new Date(currentDateNormalized);
    last7DaysDate.setDate(last7DaysDate.getDate() - 7);
    
    const last7DaysExpenses = currentMonthExpenses.filter(expense => {
      const expenseDateStr = expense.date.split('T')[0];
      const [year, month, day] = expenseDateStr.split('-').map(Number);
      const expenseDate = new Date(year, month - 1, day);
      return expenseDate >= last7DaysDate;
    });
    
    const last7DaysTotal = last7DaysExpenses.reduce((sum, expense) => {
      const amount = expense?.amount;
      if (amount == null || isNaN(Number(amount))) {
        return sum;
      }
      return sum + Number(amount);
    }, 0);
    
    const last7DaysAvg = last7DaysTotal / 7;
    const overallAvg = totalSpending / timePeriod.daysElapsed;
    
    // Média ponderada: 70% últimos 7 dias, 30% geral
    averageDailySpending = (last7DaysAvg * 0.7) + (overallAvg * 0.3);
  } else {
    // Se temos menos de 7 dias, usar média simples
    averageDailySpending = timePeriod.daysElapsed > 0 
      ? totalSpending / timePeriod.daysElapsed 
      : 0;
  }

  // Apply projection formula
  const projectedBalance = currentBalance - (averageDailySpending * timePeriod.daysRemaining);

  // Handle edge case: NaN or Infinity in projection
  if (isNaN(projectedBalance) || !isFinite(projectedBalance)) {
    return null;
  }

  // Determine confidence level based on data availability
  let confidence: 'low' | 'medium' | 'high';
  if (timePeriod.daysElapsed < 7) {
    confidence = 'low';
  } else if (timePeriod.daysElapsed < 14) {
    confidence = 'medium';
  } else {
    confidence = 'high';
  }

  return {
    projectedBalance,
    averageDailySpending,
    remainingDays: timePeriod.daysRemaining,
    confidence
  };
}

/**
 * Helper function to get time period information for a given date
 */
function getTimePeriod(currentDate: Date): TimePeriod {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month
  
  const daysInPeriod = endDate.getDate();
  const daysElapsed = currentDate.getDate();
  const daysRemaining = daysInPeriod - daysElapsed;
  
  const monthYear = `${year}-${String(month + 1).padStart(2, '0')}`;

  return {
    startDate,
    endDate,
    monthYear,
    daysInPeriod,
    daysElapsed,
    daysRemaining
  };
}

/**
 * Calculate month-over-month comparison
 * Requirements: 2.1, 2.5
 */
export function calculateMonthComparison(
  currentMonthExpenses: Expense[],
  previousMonthExpenses: Expense[]
): MonthComparison | null {
  // Handle edge case: null or undefined arrays
  if (!currentMonthExpenses || !Array.isArray(currentMonthExpenses)) {
    return null;
  }
  if (!previousMonthExpenses || !Array.isArray(previousMonthExpenses)) {
    return null;
  }

  // Handle edge case: no previous month data (empty array)
  if (previousMonthExpenses.length === 0) {
    return null;
  }

  // Calculate total spending for both months
  const currentTotal = currentMonthExpenses.reduce((sum, expense) => {
    // Handle edge case: missing or null values
    const amount = expense?.amount;
    if (amount == null || isNaN(Number(amount))) {
      return sum;
    }
    return sum + Number(amount);
  }, 0);

  const previousTotal = previousMonthExpenses.reduce((sum, expense) => {
    // Handle edge case: missing or null values
    const amount = expense?.amount;
    if (amount == null || isNaN(Number(amount))) {
      return sum;
    }
    return sum + Number(amount);
  }, 0);

  // Calculate percentage change
  // Handle division by zero: if previous total is 0, treat as 100% increase if current > 0
  let percentageChange = 0;
  if (previousTotal === 0) {
    percentageChange = currentTotal > 0 ? 100 : 0;
  } else {
    percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
  }

  // Handle edge case: NaN or Infinity in percentage
  if (isNaN(percentageChange) || !isFinite(percentageChange)) {
    percentageChange = 0;
  }

  const isIncrease = currentTotal > previousTotal;

  // Generate category-level comparisons
  const categoryComparisons = generateCategoryComparisons(
    currentMonthExpenses,
    previousMonthExpenses
  );

  return {
    currentTotal,
    previousTotal,
    percentageChange,
    isIncrease,
    categoryComparisons
  };
}

/**
 * Helper function to generate category-level comparisons
 */
function generateCategoryComparisons(
  currentMonthExpenses: Expense[],
  previousMonthExpenses: Expense[]
): CategoryComparison[] {
  // Handle edge case: null or undefined arrays
  if (!currentMonthExpenses || !previousMonthExpenses) {
    return [];
  }

  // Aggregate expenses by category for both months
  const currentByCategory = aggregateByCategory(currentMonthExpenses);
  const previousByCategory = aggregateByCategory(previousMonthExpenses);

  // Get all unique categories from both months
  const allCategories = new Set([
    ...currentByCategory.keys(),
    ...previousByCategory.keys()
  ]);

  const comparisons: CategoryComparison[] = [];

  for (const category of allCategories) {
    const currentAmount = currentByCategory.get(category) || 0;
    const previousAmount = previousByCategory.get(category) || 0;

    // Handle division by zero in percentage calculations
    let percentageChange = 0;
    if (previousAmount === 0) {
      percentageChange = currentAmount > 0 ? 100 : 0;
    } else {
      percentageChange = ((currentAmount - previousAmount) / previousAmount) * 100;
    }

    // Handle edge case: NaN or Infinity
    if (isNaN(percentageChange) || !isFinite(percentageChange)) {
      percentageChange = 0;
    }

    comparisons.push({
      category,
      currentAmount,
      previousAmount,
      percentageChange
    });
  }

  return comparisons;
}

/**
 * Helper function to aggregate expenses by category
 */
function aggregateByCategory(expenses: Expense[]): Map<string, number> {
  const categoryMap = new Map<string, number>();

  // Handle edge case: null or undefined expenses
  if (!expenses || !Array.isArray(expenses)) {
    return categoryMap;
  }

  for (const expense of expenses) {
    // Handle edge case: missing or null expense
    if (!expense) {
      continue;
    }

    // Handle edge case: missing category - default to "other"
    const category = expense.category || 'other';
    
    // Handle edge case: missing or null amount
    const amount = expense.amount;
    if (amount == null || isNaN(Number(amount))) {
      continue;
    }

    const current = categoryMap.get(category) || 0;
    categoryMap.set(category, current + Number(amount));
  }

  return categoryMap;
}

/**
 * Detect budget alerts based on spending vs limits
 * Requirements: 3.3, 3.4, 3.5
 */
export function detectBudgetAlerts(
  expenses: Expense[],
  budgetLimits: CategoryBudget[]
): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  // Handle edge case: null or undefined arrays
  if (!expenses || !Array.isArray(expenses)) {
    return alerts;
  }
  if (!budgetLimits || !Array.isArray(budgetLimits)) {
    return alerts;
  }

  // Handle edge case: empty arrays
  if (expenses.length === 0 || budgetLimits.length === 0) {
    return alerts;
  }

  // Aggregate current spending by category
  const spendingByCategory = aggregateByCategory(expenses);

  // Check each budget limit
  for (const budget of budgetLimits) {
    // Handle edge case: missing or null budget
    if (!budget) {
      continue;
    }

    // Handle edge case: missing or invalid limit amount
    const limitAmount = budget.limit_amount;
    if (limitAmount == null || isNaN(Number(limitAmount)) || limitAmount <= 0) {
      continue;
    }

    const spent = spendingByCategory.get(budget.category) || 0;
    
    // Handle division by zero
    const percentage = limitAmount > 0 ? (spent / limitAmount) * 100 : 0;

    // Handle edge case: NaN or Infinity
    if (isNaN(percentage) || !isFinite(percentage)) {
      continue;
    }

    // Generate warning alert at 80% threshold
    if (percentage >= 80 && percentage < 100) {
      alerts.push({
        category: budget.category,
        limit: limitAmount,
        spent,
        percentage,
        level: 'warning'
      });
    }

    // Generate critical alert at 100% threshold
    if (percentage >= 100) {
      alerts.push({
        category: budget.category,
        limit: limitAmount,
        spent,
        percentage,
        level: 'critical'
      });
    }
  }

  return alerts;
}

/**
 * Detect recurring expenses (3+ similar expenses at regular intervals)
 * Requirements: 4.1
 */
export function detectRecurringExpenses(expenses: Expense[]): BehaviorInsight[] {
  const insights: BehaviorInsight[] = [];
  
  // Handle edge case: null or undefined expenses
  if (!expenses || !Array.isArray(expenses)) {
    return insights;
  }

  // Handle edge case: empty expense array
  if (expenses.length === 0) {
    return insights;
  }

  // Mapeamento de categorias para português
  const categoryNames: Record<string, string> = {
    'food': 'Alimentação',
    'transport': 'Transporte',
    'entertainment': 'Lazer',
    'health': 'Saúde',
    'education': 'Educação',
    'bills': 'Contas',
    'shopping': 'Compras',
    'other': 'Outros',
  };

  // Group expenses by category
  const expensesByCategory = new Map<string, Expense[]>();
  for (const expense of expenses) {
    // Handle edge case: missing or null expense
    if (!expense) {
      continue;
    }

    const category = expense.category || 'other';
    if (!expensesByCategory.has(category)) {
      expensesByCategory.set(category, []);
    }
    expensesByCategory.get(category)!.push(expense);
  }

  // Check each category for recurring patterns
  for (const [category, categoryExpenses] of expensesByCategory) {
    if (categoryExpenses.length < 3) continue;

    // Sort by date
    const sorted = [...categoryExpenses].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Handle edge case: invalid dates
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }
      
      return dateA.getTime() - dateB.getTime();
    });

    // Look for similar amounts (within 10% variance)
    const amounts = sorted.map(e => Number(e.amount)).filter(amt => !isNaN(amt) && isFinite(amt));
    
    if (amounts.length < 3) continue;
    
    const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    
    // Handle edge case: division by zero
    if (avgAmount === 0) continue;
    
    const similarAmounts = amounts.filter(amt => 
      Math.abs(amt - avgAmount) / avgAmount <= 0.10
    );

    if (similarAmounts.length >= 3) {
      // Check for regular intervals (within 3 days variance)
      const dates = sorted
        .map(e => new Date(e.date).getTime())
        .filter(time => !isNaN(time));
      
      const intervals: number[] = [];
      
      for (let i = 1; i < dates.length; i++) {
        intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)); // days
      }

      if (intervals.length >= 2) {
        const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
        const regularIntervals = intervals.filter(int => 
          Math.abs(int - avgInterval) <= 3
        );

        if (regularIntervals.length >= 2) {
          const categoryName = categoryNames[category] || 'Outros';
          insights.push({
            type: 'recurring',
            message: `Despesa recorrente detectada em ${categoryName}`,
            priority: 2
          });
        }
      }
    }
  }

  return insights;
}

/**
 * Detect dominant category (>40% of total spending)
 * Requirements: 4.2
 */
export function detectDominantCategory(expenses: Expense[]): BehaviorInsight | null {
  // Handle edge case: null or undefined expenses
  if (!expenses || !Array.isArray(expenses)) {
    return null;
  }

  // Handle edge case: empty expense array
  if (expenses.length === 0) {
    return null;
  }

  // Mapeamento de categorias para português
  const categoryNames: Record<string, string> = {
    'food': 'Alimentação',
    'transport': 'Transporte',
    'entertainment': 'Lazer',
    'health': 'Saúde',
    'education': 'Educação',
    'bills': 'Contas',
    'shopping': 'Compras',
    'other': 'Outros',
  };

  const totalSpending = expenses.reduce((sum, expense) => {
    // Handle edge case: missing or null values
    const amount = expense?.amount;
    if (amount == null || isNaN(Number(amount))) {
      return sum;
    }
    return sum + Number(amount);
  }, 0);

  // Handle edge case: zero total spending
  if (totalSpending === 0) {
    return null;
  }

  const categoryTotals = aggregateByCategory(expenses);

  for (const [category, amount] of categoryTotals) {
    // Handle division by zero
    const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;
    
    // Handle edge case: NaN or Infinity
    if (isNaN(percentage) || !isFinite(percentage)) {
      continue;
    }

    if (percentage > 40) {
      const categoryName = categoryNames[category] || 'Outros';
      return {
        type: 'dominant_category',
        message: `${categoryName} representa ${percentage.toFixed(0)}% dos gastos`,
        priority: 2
      };
    }
  }

  return null;
}

/**
 * Detect spending consistency (variance < 20% of mean)
 * Requirements: 4.3
 */
export function detectSpendingConsistency(expenses: Expense[]): BehaviorInsight | null {
  // Handle edge case: null or undefined expenses
  if (!expenses || !Array.isArray(expenses)) {
    return null;
  }

  // Handle edge case: insufficient data
  if (expenses.length < 3) {
    return null;
  }

  // Group expenses by day
  const dailySpending = new Map<string, number>();
  
  for (const expense of expenses) {
    // Handle edge case: missing or null expense
    if (!expense || !expense.date) {
      continue;
    }

    const dateKey = expense.date.split('T')[0]; // Get date part only
    
    // Handle edge case: missing or null amount
    const amount = expense.amount;
    if (amount == null || isNaN(Number(amount))) {
      continue;
    }

    const current = dailySpending.get(dateKey) || 0;
    dailySpending.set(dateKey, current + Number(amount));
  }

  const dailyAmounts = Array.from(dailySpending.values());
  
  // Handle edge case: insufficient daily data
  if (dailyAmounts.length < 3) {
    return null;
  }

  // Calculate mean and variance
  const mean = dailyAmounts.reduce((sum, amt) => sum + amt, 0) / dailyAmounts.length;
  
  // Handle edge case: zero mean
  if (mean === 0) {
    return null;
  }

  const squaredDiffs = dailyAmounts.map(amt => Math.pow(amt - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / dailyAmounts.length;
  const stdDev = Math.sqrt(variance);

  // Handle edge case: NaN or Infinity
  if (isNaN(stdDev) || !isFinite(stdDev)) {
    return null;
  }

  // Check if variance is less than 20% of mean (handle division by zero)
  const relativeStdDev = mean > 0 ? stdDev / mean : 0;
  
  if (relativeStdDev < 0.20) {
    return {
      type: 'consistent',
      message: 'Seus gastos estão consistentes',
      priority: 1
    };
  }

  return null;
}

/**
 * Detect spending spikes (expense > 2x average)
 * Requirements: 4.4
 */
export function detectSpendingSpikes(expenses: Expense[]): BehaviorInsight[] {
  const insights: BehaviorInsight[] = [];
  
  // Handle edge case: null or undefined expenses
  if (!expenses || !Array.isArray(expenses)) {
    return insights;
  }

  // Handle edge case: empty expense array
  if (expenses.length === 0) {
    return insights;
  }

  // Mapeamento de categorias para português
  const categoryNames: Record<string, string> = {
    'food': 'Alimentação',
    'transport': 'Transporte',
    'entertainment': 'Lazer',
    'health': 'Saúde',
    'education': 'Educação',
    'bills': 'Contas',
    'shopping': 'Compras',
    'other': 'Outros',
  };

  // Filter valid expenses and calculate average
  const validExpenses = expenses.filter(expense => {
    if (!expense) return false;
    const amount = expense.amount;
    return amount != null && !isNaN(Number(amount)) && Number(amount) > 0;
  });

  if (validExpenses.length === 0) {
    return insights;
  }

  const avgAmount = validExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0) / validExpenses.length;

  // Handle edge case: zero average
  if (avgAmount === 0) {
    return insights;
  }

  for (const expense of validExpenses) {
    const amount = Number(expense.amount);
    
    if (amount > 2 * avgAmount) {
      const categoryName = categoryNames[expense.category || 'other'] || 'Outros';
      insights.push({
        type: 'spike',
        message: `Gasto alto em ${categoryName}: R$ ${amount.toFixed(2)}`,
        priority: 3
      });
    }
  }

  return insights;
}

/**
 * Generate all behavioral insights
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function generateBehaviorInsights(expenses: Expense[]): BehaviorInsight[] {
  const insights: BehaviorInsight[] = [];

  // Handle edge case: null or undefined expenses
  if (!expenses || !Array.isArray(expenses)) {
    return insights;
  }

  // Detect recurring expenses
  insights.push(...detectRecurringExpenses(expenses));

  // Detect dominant category
  const dominantInsight = detectDominantCategory(expenses);
  if (dominantInsight) {
    insights.push(dominantInsight);
  }

  // Detect spending consistency
  const consistencyInsight = detectSpendingConsistency(expenses);
  if (consistencyInsight) {
    insights.push(consistencyInsight);
  }

  // Detect spending spikes
  insights.push(...detectSpendingSpikes(expenses));

  return insights;
}

/**
 * Prioritize and filter insights
 * Requirements: 4.5, 5.1, 5.4, 5.5
 */
export function prioritizeAndFilterInsights(
  insights: BehaviorInsight[],
  dismissedInsights: DismissedInsight[] = []
): BehaviorInsight[] {
  // Filter out dismissed insights within 24-hour window
  const now = new Date();
  const activeDismissals = new Set(
    dismissedInsights
      .filter(dismissed => new Date(dismissed.expires_at) > now)
      .map(dismissed => dismissed.insight_key)
  );

  let filtered = insights.filter(insight => {
    const insightKey = `${insight.type}_${insight.message}`;
    return !activeDismissals.has(insightKey);
  });

  // Validate message length (max 100 characters)
  filtered = filtered.map(insight => {
    if (insight.message.length > 100) {
      return {
        ...insight,
        message: insight.message.substring(0, 97) + '...'
      };
    }
    return insight;
  });

  // Sort by priority (higher priority first - critical > warning > info)
  // Priority: 3 = critical, 2 = warning, 1 = info
  filtered.sort((a, b) => b.priority - a.priority);

  // Limit to maximum 3 insights
  return filtered.slice(0, 3);
}

/**
 * Generate insight key for dismissal tracking
 */
export function generateInsightKey(insight: BehaviorInsight): string {
  return `${insight.type}_${insight.message}`;
}

// Message Formatting Utilities

/**
 * Format currency value using BRL conventions
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function formatCurrency(amount: number): string {
  // Handle edge case: null, undefined, or NaN
  if (amount == null || isNaN(amount)) {
    return 'R$ 0,00';
  }

  // Handle edge case: Infinity
  if (!isFinite(amount)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

/**
 * Format projection message
 * Requirements: 1.2, 1.3
 * @param projection - The monthly projection data, or null if insufficient data
 * @returns Formatted message string
 */
export function formatProjectionMessage(projection: MonthlyProjection | null): string {
  if (projection === null) {
    return 'Dados insuficientes para projeção. Continue registrando suas despesas.';
  }

  const formattedBalance = formatCurrency(projection.projectedBalance);
  return `Mantendo esse ritmo, seu saldo final será de ${formattedBalance}`;
}

/**
 * Format comparison message
 * Requirements: 2.2, 2.3
 * @param comparison - The month comparison data, or null if no previous data
 * @returns Formatted message string, or null if no comparison available
 */
export function formatComparisonMessage(comparison: MonthComparison | null): string | null {
  if (comparison === null) {
    return null;
  }

  // Handle edge case: previous month total is zero
  if (comparison.previousTotal === 0) {
    return 'Primeiro mês com dados';
  }

  const percentageFormatted = Math.abs(comparison.percentageChange).toFixed(1);

  if (comparison.isIncrease) {
    return `Você gastou ${percentageFormatted}% a mais que no mês passado`;
  } else {
    return `Você gastou ${percentageFormatted}% a menos que no mês passado`;
  }
}
