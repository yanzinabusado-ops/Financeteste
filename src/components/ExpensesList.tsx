import { useState } from 'react';
import type { Expense } from '../types/database';
import ExpenseItem from './ExpenseItem';
import { Receipt, TrendingDown } from 'lucide-react';

interface ExpensesListProps {
  expenses: Expense[];
  onExpenseUpdated: (expense: Expense) => void;
  onExpenseDeleted: (id: string) => void;
}

const CATEGORIES = [
  { value: 'all', label: 'Todas', icon: '📋' },
  { value: 'food', label: 'Alimentação', icon: '🍔' },
  { value: 'transport', label: 'Transporte', icon: '🚗' },
  { value: 'entertainment', label: 'Lazer', icon: '🎬' },
  { value: 'health', label: 'Saúde', icon: '💊' },
  { value: 'education', label: 'Educação', icon: '📚' },
  { value: 'bills', label: 'Contas', icon: '💡' },
  { value: 'shopping', label: 'Compras', icon: '🛍️' },
  { value: 'other', label: 'Outros', icon: '📦' },
];

export default function ExpensesList({
  expenses,
  onExpenseUpdated,
  onExpenseDeleted,
}: ExpensesListProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredExpenses =
    selectedCategory === 'all'
      ? expenses
      : expenses.filter((exp) => exp.category === selectedCategory);

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-teal-100 p-3 rounded-xl">
          <Receipt className="w-6 h-6 text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Minhas Despesas</h2>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.05] ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
              {cat.value !== 'all' && categoryTotals[cat.value] && (
                <span className="ml-1 text-xs">
                  ({categoryTotals[cat.value].toFixed(0)})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <TrendingDown className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">
            {selectedCategory === 'all'
              ? 'Nenhuma despesa cadastrada ainda'
              : 'Nenhuma despesa nesta categoria'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onUpdate={onExpenseUpdated}
              onDelete={onExpenseDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
