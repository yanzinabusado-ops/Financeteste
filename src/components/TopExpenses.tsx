import { getTopExpenses, getCategoryIcon, getCategoryLabel } from '../lib/insights';
import type { Expense } from '../types/database';
import { Crown, TrendingDown } from 'lucide-react';

interface TopExpensesProps {
  expenses: Expense[];
}

export default function TopExpenses({ expenses }: TopExpensesProps) {
  const topExpenses = getTopExpenses(expenses, 3);

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return '•';
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100 h-full flex flex-col items-center justify-center">
        <Crown className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-center">Nenhuma despesa registrada ainda</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-yellow-100 p-2 rounded-lg">
          <Crown className="w-5 h-5 text-yellow-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Maiores Despesas</h2>
      </div>

      <div className="space-y-3">
        {topExpenses.map((expense, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200 hover:border-yellow-300 transition-all duration-200 hover:shadow-md group animate-slideDown"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-2xl font-bold text-yellow-600 min-w-8">
                  {getMedalEmoji(index)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{expense.description}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full font-medium">
                      {getCategoryIcon(expense.category)} {getCategoryLabel(expense.category)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(expense.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-lg font-bold text-red-600">R$ {expense.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{expense.percentage.toFixed(1)}% do total</p>
              </div>
            </div>

            <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-500"
                style={{ width: `${Math.min(expense.percentage * 3, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {expenses.length > 3 && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            <span>e mais {expenses.length - 3} despesa{expenses.length - 3 > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}
    </div>
  );
}
