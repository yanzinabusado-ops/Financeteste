import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, Save, Target, Trash2 } from 'lucide-react';
import type { CategoryBudget } from '../types/database';
import { saveCategoryBudget, deleteCategoryBudget } from '../lib/budgets';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  currentBudgets: CategoryBudget[];
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

export default function BudgetSettingsModal({
  isOpen,
  onClose,
  onSaved,
  currentBudgets,
}: BudgetSettingsModalProps) {
  const { user } = useAuth();
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const currentMonthYear = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (isOpen) {
      // Initialize inputs with current budgets
      const inputs: Record<string, string> = {};
      currentBudgets.forEach((budget) => {
        inputs[budget.category] = budget.limit_amount.toString();
      });
      setBudgetInputs(inputs);
    }
  }, [isOpen, currentBudgets]);

  const handleInputChange = (category: string, value: string) => {
    setBudgetInputs((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      // Identificar categorias que tinham limite mas agora estão vazias (para deletar)
      const categoriesToDelete = currentBudgets
        .filter(budget => {
          const inputValue = budgetInputs[budget.category];
          return !inputValue || inputValue.trim() === '' || parseFloat(inputValue) <= 0;
        })
        .map(budget => budget.category);

      // Identificar categorias com valores válidos (para salvar/atualizar)
      const categoriesToSave = Object.entries(budgetInputs)
        .filter(([_, value]) => value && value.trim() !== '' && parseFloat(value) > 0);

      // Deletar limites removidos
      const deletePromises = categoriesToDelete.map(category =>
        deleteCategoryBudget(user.id, category, currentMonthYear)
      );

      // Salvar/atualizar limites
      const savePromises = categoriesToSave.map(([category, value]) =>
        saveCategoryBudget(user.id, category, currentMonthYear, parseFloat(value))
      );

      await Promise.all([...deletePromises, ...savePromises]);

      onSaved();
      onClose();
    } catch (error) {
      console.error('Error saving budgets:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Configurar Orçamentos</h2>
              <p className="text-sm text-gray-600">Defina limites mensais por categoria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const currentValue = budgetInputs[cat.value] || '';
              const hasValue = currentValue !== '';

              return (
                <div
                  key={cat.value}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    hasValue
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <label
                    htmlFor={`budget-${cat.value}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    <span className="text-xl mr-2">{cat.icon}</span>
                    {cat.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      R$
                    </span>
                    <input
                      id={`budget-${cat.value}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="999999999"
                      value={currentValue}
                      onChange={(e) => handleInputChange(cat.value, e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                      placeholder="0,00"
                    />
                  </div>
                  {hasValue && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <span>✓</span>
                      <span>Limite definido</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Dica:</span> Deixe em branco ou digite 0 para remover o limite de uma categoria.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Orçamentos'}
          </button>
        </div>
      </div>
    </div>
  );
}
