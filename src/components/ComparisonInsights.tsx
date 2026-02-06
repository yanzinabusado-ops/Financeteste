import { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, ArrowRight } from 'lucide-react';
import type { Expense } from '../types/database';
import { calculateMonthComparison, formatComparisonMessage, formatCurrency } from '../lib/analytics';
import { useDebounce } from '../hooks/useDebounce';

interface ComparisonInsightsProps {
  expenses: Expense[];
}

export default function ComparisonInsights({ expenses }: ComparisonInsightsProps) {
  // Debounce expenses to avoid recalculation on rapid expense additions (300ms delay)
  const debouncedExpenses = useDebounce(expenses, 300);

  // Filter expenses for current and previous month
  const { currentMonthExpenses, previousMonthExpenses } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Current month boundaries
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);

    // Previous month boundaries
    const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const previousMonthEnd = new Date(currentYear, currentMonth, 0);

    const current = debouncedExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
    });

    const previous = debouncedExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= previousMonthStart && expenseDate <= previousMonthEnd;
    });

    return {
      currentMonthExpenses: current,
      previousMonthExpenses: previous
    };
  }, [debouncedExpenses]);

  // Calculate comparison using analytics service
  const comparison = useMemo(() => {
    return calculateMonthComparison(currentMonthExpenses, previousMonthExpenses);
  }, [currentMonthExpenses, previousMonthExpenses]);

  // Format the comparison message
  const comparisonMessage = useMemo(() => {
    return formatComparisonMessage(comparison);
  }, [comparison]);

  // Handle case when no previous data exists
  if (!comparison || !comparisonMessage) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Dados insuficientes para comparação</p>
        <p className="text-sm mt-2">Continue registrando suas despesas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall comparison message */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {comparison.isIncrease ? (
            <TrendingUp className="w-6 h-6 text-red-500" aria-hidden="true" />
          ) : (
            <TrendingDown className="w-6 h-6 text-green-500" aria-hidden="true" />
          )}
          <p 
            className={`text-lg font-semibold ${
              comparison.isIncrease ? 'text-red-600' : 'text-green-600'
            }`}
            aria-live="polite"
            aria-atomic="true"
          >
            {comparisonMessage}
          </p>
        </div>

        {/* Month totals */}
        <div className="flex items-center justify-between text-sm text-gray-600 pl-9">
          <span>Mês anterior: {formatCurrency(comparison.previousTotal)}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
          <span>Mês atual: {formatCurrency(comparison.currentTotal)}</span>
        </div>
      </div>

      {/* Category-level comparison breakdown */}
      {comparison.categoryComparisons.length > 0 && (
        <section className="pt-4 border-t border-gray-100" aria-labelledby="category-comparison-title">
          <h3 id="category-comparison-title" className="text-sm font-semibold text-gray-700 mb-3">
            Comparação por Categoria
          </h3>
          <ul className="space-y-2 max-h-64 overflow-y-auto" role="list">
            {comparison.categoryComparisons
              .sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange))
              .map((categoryComp) => {
                const isIncrease = categoryComp.currentAmount > categoryComp.previousAmount;
                const hasChange = categoryComp.percentageChange !== 0;

                return (
                  <li
                    key={categoryComp.category}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 capitalize">
                        {categoryComp.category}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                        <span>{formatCurrency(categoryComp.previousAmount)}</span>
                        <ArrowRight className="w-3 h-3" aria-hidden="true" />
                        <span>{formatCurrency(categoryComp.currentAmount)}</span>
                      </div>
                    </div>

                    {hasChange && (
                      <div 
                        className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                          isIncrease ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}
                        aria-label={`${isIncrease ? 'Aumento' : 'Redução'} de ${Math.abs(categoryComp.percentageChange).toFixed(1)} por cento`}
                      >
                        {isIncrease ? (
                          <>
                            <TrendingUp className="w-3 h-3" aria-hidden="true" />
                            <span className="text-xs font-semibold">↑</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3" aria-hidden="true" />
                            <span className="text-xs font-semibold">↓</span>
                          </>
                        )}
                        <span className="text-xs font-semibold">
                          {Math.abs(categoryComp.percentageChange).toFixed(1)}%
                        </span>
                      </div>
                    )}

                    {!hasChange && (
                      <div className="px-2 py-1 bg-gray-200 text-gray-600 rounded-md">
                        <span className="text-xs font-semibold">= Igual</span>
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </section>
      )}
    </div>
  );
}
