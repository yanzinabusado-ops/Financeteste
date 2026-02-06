import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Income } from '../types/database';
import { DollarSign, Edit2, Check, X } from 'lucide-react';

interface IncomeCardProps {
  income: Income | null;
  monthYear: string;
  onUpdate: (income: Income) => void;
}

export default function IncomeCard({ income, monthYear, onUpdate }: IncomeCardProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(!income);
  const [amount, setAmount] = useState(income?.amount?.toString() || '');
  const [description, setDescription] = useState(income?.description || '');
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

    // Sanitizar descrição
    const sanitizedDescription = description
      .replace(/[<>]/g, '')
      .trim()
      .slice(0, 200);

    setLoading(true);

    const incomeData = {
      user_id: user.id,
      amount: numAmount,
      month_year: monthYear,
      description: sanitizedDescription,
    };

    if (income) {
      // @ts-ignore - Supabase type inference issue with strict mode
      const { data, error} = await supabase
        .from('income')
        .update(incomeData)
        .eq('id', income.id)
        .select()
        .single();

      if (!error && data) {
        onUpdate(data);
        setIsEditing(false);
      }
    } else {
      // @ts-ignore - Supabase type inference issue with strict mode
      const { data, error } = await supabase
        .from('income')
        .insert([incomeData])
        .select()
        .single();

      if (!error && data) {
        onUpdate(data);
        setIsEditing(false);
      }
    }

    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 h-fit sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Renda Mensal</h2>
        </div>
        {income && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-emerald-600 transition-colors duration-200"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Renda
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="999999999"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 outline-none"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <input
              type="text"
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 outline-none"
              placeholder="Ex: Salário, freelance..."
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            {income && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setAmount(income.amount.toString());
                  setDescription(income.description);
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Valor Total</p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency(income?.amount || 0)}
            </p>
          </div>

          {income?.description && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Descrição</p>
              <p className="text-gray-800">{income.description}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Mês de referência: {new Date(monthYear + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
