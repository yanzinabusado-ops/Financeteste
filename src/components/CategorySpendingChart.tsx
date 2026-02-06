import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Settings, TrendingUp } from 'lucide-react';
import type { Expense, CategoryBudget } from '../types/database';
import { getCategoryBreakdown } from '../lib/insights';
import { fetchBudgetLimits } from '../lib/budgets';
import BudgetSettingsModal from './BudgetSettingsModal';

interface CategorySpendingChartProps {
  expenses: Expense[];
}

export default function CategorySpendingChart({ expenses }: CategorySpendingChartProps) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentMonthYear = new Date().toISOString().slice(0, 7);

  // Get current month expenses
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const expMonthYear = expDate.toISOString().slice(0, 7);
      return expMonthYear === currentMonthYear;
    });
  }, [expenses, currentMonthYear]);

  const categoryBreakdown = getCategoryBreakdown(currentMonthExpenses);
  const totalExpenses = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);

  useEffect(() => {
    if (user) {
      loadBudgets();
    }
  }, [user, currentMonthYear]);

  const loadBudgets = async () => {
    if (!user) return;
    setLoading(true);
    const fetchedBudgets = await fetchBudgetLimits(user.id, currentMonthYear);
    setBudgets(fetchedBudgets);
    setLoading(false);
  };

  const handleBudgetsSaved = () => {
    loadBudgets();
  };

  // Get budget info for a category
  const getBudgetInfo = (category: string) => {
    const budget = budgets.find(b => b.category === category);
    if (!budget) return null;

    const spent = categoryBreakdown.find(c => c.category === category)?.amount || 0;
    const percentage = (spent / budget.limit_amount) * 100;

    return {
      limit: budget.limit_amount,
      spent,
      percentage,
      remaining: Math.max(budget.limit_amount - spent, 0),
      isOverBudget: spent > budget.limit_amount,
      isNearLimit: percentage >= 80 && percentage < 100,
    };
  };

  if (currentMonthExpenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 h-full flex flex-col items-center justify-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-center mb-4">Adicione despesas para ver o gráfico</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configurar Orçamentos
        </button>
        <BudgetSettingsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={handleBudgetsSaved}
          currentBudgets={budgets}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-100 p-2 rounded-lg">
              <BarChart3 className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Gastos por Categoria</h2>
          </div>
          {budgets.length > 0 && (
            <p className="text-sm text-gray-600">
              Categorias com limite: <span className="font-semibold text-teal-600">{budgets.length} de {categoryBreakdown.length}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Configurar Limites
        </button>
      </div>

      {/* Visual Chart - Barra de Proporção */}
      <div className="mb-6 bg-gray-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribuição dos Gastos</h3>
        <div className="flex h-8 rounded-lg overflow-hidden shadow-inner">
          {categoryBreakdown
            .sort((a, b) => b.amount - a.amount)
            .map((category, index) => (
              <div
                key={category.category}
                className="relative group transition-all duration-300 hover:opacity-80"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: [
                    '#14b8a6', // teal
                    '#10b981', // emerald
                    '#3b82f6', // blue
                    '#f59e0b', // amber
                    '#ef4444', // red
                    '#8b5cf6', // violet
                    '#ec4899', // pink
                  ][index % 7],
                }}
              >
                {category.percentage > 8 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {category.percentage.toFixed(0)}%
                    </span>
                  </div>
                )}
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {category.label}: R$ {category.amount.toFixed(2)}
                </div>
              </div>
            ))}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3">
          {categoryBreakdown
            .sort((a, b) => b.amount - a.amount)
            .map((category, index) => (
              <div key={category.category} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: [
                      '#14b8a6',
                      '#10b981',
                      '#3b82f6',
                      '#f59e0b',
                      '#ef4444',
                      '#8b5cf6',
                      '#ec4899',
                    ][index % 7],
                  }}
                />
                <span className="text-xs text-gray-600">{category.icon} {category.label}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-4">
        {categoryBreakdown
          .sort((a, b) => b.amount - a.amount)
          .map((category) => {
            const budgetInfo = getBudgetInfo(category.category);
            const hasLimit = budgetInfo !== null;

            return (
              <div
                key={category.category}
                className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  hasLimit
                    ? budgetInfo.isOverBudget
                      ? 'border-red-200 bg-red-50/50'
                      : budgetInfo.isNearLimit
                      ? 'border-yellow-200 bg-yellow-50/50'
                      : 'border-emerald-200 bg-emerald-50/50'
                    : 'border-gray-200 bg-gray-50/50 hover:border-gray-300'
                }`}
              >
                {/* Background Progress */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ${
                    hasLimit
                      ? budgetInfo.isOverBudget
                        ? 'bg-gradient-to-r from-red-100/60 to-transparent'
                        : budgetInfo.isNearLimit
                        ? 'bg-gradient-to-r from-yellow-100/60 to-transparent'
                        : 'bg-gradient-to-r from-emerald-100/60 to-transparent'
                      : 'bg-gradient-to-r from-gray-100/60 to-transparent'
                  }`}
                  style={{
                    width: hasLimit
                      ? `${Math.min(budgetInfo.percentage, 100)}%`
                      : `${category.percentage}%`,
                  }}
                />

                {/* Content */}
                <div className="relative p-4">
                  <div className="flex items-start justify-between mb-3">
                    {/* Left: Icon and Name */}
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{category.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{category.label}</h3>
                        <p className="text-xs text-gray-500">
                          {category.percentage.toFixed(1)}% dos gastos totais
                        </p>
                      </div>
                    </div>

                    {/* Right: Amount */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        R$ {category.amount.toFixed(2)}
                      </p>
                      {hasLimit && (
                        <p className="text-xs text-gray-600">
                          de R$ {budgetInfo.limit.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Bar */}
                  {hasLimit ? (
                    <div className="space-y-2">
                      {/* Progress Indicator */}
                      <div className="flex items-center justify-between text-sm">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${
                            budgetInfo.isOverBudget
                              ? 'bg-red-600 text-white'
                              : budgetInfo.isNearLimit
                              ? 'bg-yellow-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {budgetInfo.isOverBudget && <span>⚠️ {budgetInfo.percentage.toFixed(0)}%</span>}
                          {budgetInfo.isNearLimit && <span>⚡ {budgetInfo.percentage.toFixed(0)}%</span>}
                          {!budgetInfo.isOverBudget && !budgetInfo.isNearLimit && (
                            <span>✓ {budgetInfo.percentage.toFixed(0)}%</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Restante: R$ {budgetInfo.remaining.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 italic">Sem limite definido</span>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                      >
                        + Definir limite
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Summary - Total Destacado */}
      <div className="mt-6 pt-4 border-t-2 border-teal-200">
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-700">Total Gasto:</span>
            <span className="text-2xl font-bold text-teal-600">
              R$ {totalExpenses.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Budget Settings Modal */}
      <BudgetSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleBudgetsSaved}
        currentBudgets={budgets}
      />
    </div>
  );
}
