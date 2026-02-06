import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import type { Expense } from '../types/database';
import { Edit2, Trash2, Check, X, Calendar } from 'lucide-react';

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

  const categoryInfo = CATEGORIES.find((cat) => cat.value === expense.category) || CATEGORIES[CATEGORIES.length - 1];

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();

    // Validar valor numérico
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor, insira um valor válido maior que zero');
      return;
    }

    if (numAmount > 999999999) {
      alert('Valor muito alto. Máximo permitido: R$ 999.999.999,00');
      return;
    }

    // Sanitizar descrição
    const sanitizedDescription = description
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 200);

    if (!sanitizedDescription) {
      alert('Por favor, insira uma descrição válida');
      return;
    }

    setLoading(true);

    // @ts-ignore - Supabase type inference issue with strict mode
    const { data, error } = await supabase
      .from('expenses')
      .update({
        description: sanitizedDescription,
        amount: numAmount,
        category,
        date,
      })
      .eq('id', expense.id)
      .select()
      .single();

    if (!error && data) {
      onUpdate(data);
      setIsEditing(false);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    setLoading(true);

    const { error } = await supabase.from('expenses').delete().eq('id', expense.id);

    if (!error) {
      onDelete(expense.id);
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
        <form onSubmit={handleUpdate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none text-sm"
              placeholder="Descrição"
            />

            <input
              type="number"
              step="0.01"
              min="0.01"
              max="999999999"
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
    <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-teal-300 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-center justify-between gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl flex items-center justify-center text-2xl">
            {categoryInfo.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate text-lg">{expense.description}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 rounded-full font-semibold">
              {categoryInfo.label}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium">{formatDate(expense.date)}</span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="flex-shrink-0 text-right">
          <p className="text-2xl font-bold text-red-600">{formatCurrency(Number(expense.amount))}</p>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2.5 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all duration-200 hover:scale-110"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 disabled:opacity-50"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
