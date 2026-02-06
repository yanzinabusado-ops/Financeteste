import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Expense } from '../types/database';
import { Plus, ShoppingCart } from 'lucide-react';

interface AddExpenseProps {
  onExpenseAdded: (expense: Expense) => void;
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

export default function AddExpense({ onExpenseAdded }: AddExpenseProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

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

    // Sanitizar descrição (remover caracteres perigosos)
    const sanitizedDescription = description
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 200); // Limitar tamanho

    if (!sanitizedDescription) {
      alert('Por favor, insira uma descrição válida');
      return;
    }

    setLoading(true);

    // @ts-ignore - Supabase type inference issue with strict mode
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        description: sanitizedDescription,
        amount: numAmount,
        category,
        date,
      })
      .select()
      .single();

    if (!error && data) {
      onExpenseAdded(data);
      setDescription('');
      setAmount('');
      setCategory('other');
      setDate(new Date().toISOString().split('T')[0]);
      setIsOpen(false);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-teal-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-3 rounded-xl">
            <ShoppingCart className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Nova Despesa</h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors duration-200"
        >
          <Plus className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-slideDown">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="Ex: Almoço no restaurante"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="999999999"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? 'Adicionando...' : 'Adicionar Despesa'}
          </button>
        </form>
      )}
    </div>
  );
}
