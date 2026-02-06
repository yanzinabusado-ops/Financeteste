import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveCategoryBudget, fetchBudgetLimits } from '../lib/budgets';
import type { CategoryBudget, Expense } from '../types/database';
import { Target, ChevronDown, ChevronUp, Save } from 'lucide-react';

interface BudgetManagerProps {
  expenses: Expense[];
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

export default function BudgetManager({ expenses }: BudgetManagerProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentMonthYear = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (user && isOpen) {
      loadBudgets();
    }
  }, [user, isOpen]);

  const loadBudgets = async () => {
    if (!user) return;

    setLoading(true);
    const fetchedBudgets = await fetchBudgetLimits(user.id, currentMonthYear);
    setBudgets(fetchedBudgets);

    // Initialize input values with existing budgets
    const inputs: Record<string, string> = {};
    fetchedBudgets.forEach(budget => {
      inputs[budget.category] = budget.limit_amount.toString();
    });
    setBudgetInputs(inputs);
    setLoading(false);
  };

  const handleInputChange = (category: string, value: string) => {
    setBudgetInputs(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    // Save all budgets that have values
    const savePromises = Object.entries(budgetInputs)
      .filter(([_, value]) => value && parseFloat(value) > 0)
      .map(([category, value]) =>
        saveCategoryBudget(user.id, category, currentMonthYear, parseFloat(value))
      );

    await Promise.all(savePromises);

    // Reload budgets to get updated data
    await loadBudgets();
    setSaving(false);
  };

  // Calculate spending per category
  const categorySpending = expenses
    .filter(exp => {
      const expDate = new Date(exp.date);
      const expMonthYear = expDate.toISOString().slice(0, 7);
      return expMonthYear === currentMonthYear;
    })
    .reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
      return acc;
    }, {} as Record<string, number>);

  // Get budget status for a category
  const getBudgetStatus = (category: string) => {
    const budget = budgets.find(b => b.category === category);
    if (!budget) return null;

    const spent = categorySpending[category] || 0;
    const percentage = (spent / budget.limit_amount) * 100;

    let color = 'bg-green-500';
    if (percentage >= 100) {
      color = 'bg-red-500';
    } else if (percentage >= 80) {
      color = 'bg-yellow-500';
    }

    return {
      limit: budget.limit_amount,
      spent,
      percentage: Math.min(percentage, 100),
      color,
      remaining: Math.max(budget.limit_amount - spent, 0)
    };
  };

  return (
    <section 
      className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100"
      aria-labelledby="budget-manager-title"
    >
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-3 rounded-xl" aria-hidden="true">
            <Target className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 id="budget-manager-title" className="text-xl font-bold text-gray-800">
            Orçamentos por Categoria
          </h2>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200"
          aria-expanded={isOpen}
          aria-controls="budget-manager-content"
          aria-label={isOpen ? 'Fechar gerenciador de orçamentos' : 'Abrir gerenciador de orçamentos'}
        >
          {isOpen ? (
            <ChevronUp className="w-6 h-6" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-6 h-6" aria-hidden="true" />
          )}
        </button>
      </header>

      {isOpen && (
        <div id="budget-manager-content" className="space-y-6 animate-slideDown">
          {loading ? (
            <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="sr-only">Carregando orçamentos...</span>
            </div>
          ) : (
            <>
              {/* Budget Form */}
              <form onSubmit={handleSubmit} className="space-y-4" aria-label="Formulário de orçamentos por categoria">
                <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <legend className="sr-only">Definir limites de orçamento por categoria</legend>
                  {CATEGORIES.map(cat => (
                    <div key={cat.value}>
                      <label htmlFor={`budget-${cat.value}`} className="block text-sm font-medium text-gray-700 mb-2">
                        {cat.icon} {cat.label}
                      </label>
                      <input
                        id={`budget-${cat.value}`}
                        type="number"
                        step="0.01"
                        min="0"
                        max="999999999"
                        value={budgetInputs[cat.value] || ''}
                        onChange={(e) => handleInputChange(cat.value, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 outline-none"
                        placeholder="Limite mensal"
                        aria-describedby={`budget-${cat.value}-desc`}
                      />
                      <span id={`budget-${cat.value}-desc`} className="sr-only">
                        Defina o limite mensal de gastos para {cat.label}
                      </span>
                    </div>
                  ))}
                </fieldset>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  aria-label={saving ? 'Salvando orçamentos' : 'Salvar orçamentos'}
                >
                  <Save className="w-5 h-5" aria-hidden="true" />
                  {saving ? 'Salvando...' : 'Salvar Orçamentos'}
                </button>
              </form>

              {/* Budget Progress Bars */}
              {budgets.length > 0 && (
                <section className="space-y-4 pt-4 border-t border-gray-200" aria-labelledby="budget-status-title">
                  <h3 id="budget-status-title" className="text-lg font-semibold text-gray-800">
                    Status dos Orçamentos
                  </h3>
                  <ul className="space-y-4" role="list">
                    {CATEGORIES.map(cat => {
                      const status = getBudgetStatus(cat.value);
                      if (!status) return null;

                      return (
                        <li key={cat.value} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">
                              {cat.icon} {cat.label}
                            </span>
                            <span className="text-gray-600" aria-label={`Gasto ${status.spent.toFixed(2)} reais de ${status.limit.toFixed(2)} reais`}>
                              R$ {status.spent.toFixed(2)} / R$ {status.limit.toFixed(2)}
                            </span>
                          </div>
                          <div 
                            className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden"
                            role="progressbar"
                            aria-valuenow={status.percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${cat.label}: ${status.percentage.toFixed(1)}% do orçamento utilizado`}
                          >
                            <div
                              className={`h-full ${status.color} transition-all duration-500 ease-out relative`}
                              style={{ width: `${status.percentage}%` }}
                            >
                              {/* Pattern overlay for colorblind accessibility */}
                              {status.percentage >= 100 && (
                                <div 
                                  className="absolute inset-0 opacity-30"
                                  style={{
                                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, white 2px, white 4px)'
                                  }}
                                  aria-hidden="true"
                                />
                              )}
                              {status.percentage >= 80 && status.percentage < 100 && (
                                <div 
                                  className="absolute inset-0 opacity-20"
                                  style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, white 3px, white 6px)'
                                  }}
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span 
                              className={`font-medium flex items-center gap-1 ${
                                status.percentage >= 100 ? 'text-red-600' :
                                status.percentage >= 80 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}
                              aria-label={`${status.percentage.toFixed(1)} por cento utilizado - ${
                                status.percentage >= 100 ? 'Limite excedido' :
                                status.percentage >= 80 ? 'Atenção' :
                                'Dentro do limite'
                              }`}
                            >
                              {status.percentage >= 100 && <span aria-hidden="true">⚠</span>}
                              {status.percentage >= 80 && status.percentage < 100 && <span aria-hidden="true">!</span>}
                              {status.percentage < 80 && <span aria-hidden="true">✓</span>}
                              <span>
                                {status.percentage.toFixed(1)}% utilizado
                                {status.percentage >= 100 && ' (Excedido)'}
                                {status.percentage >= 80 && status.percentage < 100 && ' (Atenção)'}
                              </span>
                            </span>
                            <span className="text-gray-500">
                              Restante: R$ {status.remaining.toFixed(2)}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
