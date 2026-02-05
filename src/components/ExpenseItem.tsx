import { useState, FormEvent } from 'react';
import { expenseService, formatError } from '../services/supabase';
import type { Expense } from '../types/database';
import { Edit2, Trash2, Check, X, Calendar, AlertCircle } from 'lucide-react';

interface ExpenseItemProps {
  expense: Expense;
  onUpdate: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = [
  { value: 'food', label: 'Alimentação', icon: '🍔' },
  { value: 'transport', label: 'Transporte', icon: '🚗' },
  { value: 'entertainment', label: 'Lazer', icon: '🎬' },
  { value: 'health', label: 'Saúde', icon: '💊' },
  { value: 'education', label: 'Educação', icon: '📚' },
  { value: 'bills', label: 'Contas', icon: '💡' },
  { value: 'shopping', label: 'Compras', icon: '🛍️' },
  { value: 'other', label: 'Outros', icon: '📦' },
];

export default function ExpenseItem({ expense, onUpdate, onDelete }: ExpenseItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);
  const [date, setDate] = useState(expense.date);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryInfo = CATEGORIES.find((cat) => cat.value === expense.category) || CATEGORIES[CATEGORIES.length - 1];

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await expenseService.update(expense.id, {
        description,
        amount: parseFloat(amount),
        category,
        date,
      });

      onUpdate(data);
      setIsEditing(false);
    } catch (err) {
      setError(formatError(err).message);
      console.error('Error updating expense:', err);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    setLoading(true);
    setError(null);

    try {
      await expenseService.delete(expense.id);
      onDelete(expense.id);
    } catch (err) {
      setError(formatError(err).message);
      console.error('Error deleting expense:', err);
    }

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  if (isEditing) {
    return (
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border-2 border-teal-200 animate-slideDown">
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
        <form onSubmit={handleUpdate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none text-sm"
              placeholder="Descrição"
            />

            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none text-sm"
              placeholder="Valor"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none text-sm"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-2 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <Check className="w-4 h-4" />
              Salvar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setDescription(expense.description);
                setAmount(expense.amount.toString());
                setCategory(expense.category);
                setDate(expense.date);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-3xl">{categoryInfo.icon}</div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{expense.description}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full font-medium">
                {categoryInfo.label}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(expense.date)}
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-red-600">{formatCurrency(Number(expense.amount))}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
