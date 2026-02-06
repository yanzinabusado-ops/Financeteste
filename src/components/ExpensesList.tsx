import { useState, useMemo } from 'react';
import type { Expense } from '../types/database';
import ExpenseItem from './ExpenseItem';
import { Receipt, TrendingDown, ChevronLeft, ChevronRight, Calendar, Clock, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom' | 'all'>('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const ITEMS_PER_PAGE = 10;

  // Get today's date in YYYY-MM-DD format
  const today = useMemo(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }, []);

  // Get date ranges
  const getDateRange = useMemo(() => {
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return { start: today, end: today };
      
      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start: weekAgo.toISOString().split('T')[0], end: today };
      }
      
      case 'month': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start: monthAgo.toISOString().split('T')[0], end: today };
      }
      
      case 'custom':
        return { start: customStartDate, end: customEndDate };
      
      case 'all':
      default:
        return null;
    }
  }, [dateFilter, today, customStartDate, customEndDate]);

  const filteredExpenses = useMemo(() => {
    let filtered = expenses;

    // Filter by date range
    if (getDateRange) {
      filtered = filtered.filter(exp => {
        return exp.date >= getDateRange.start && exp.date <= getDateRange.end;
      });
    }

    // Filter by categories (multiple selection)
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(exp => selectedCategories.includes(exp.category));
    }
    
    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedCategories, getDateRange]);

  // Calculate totals for today
  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [filteredExpenses]);

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  // Toggle category selection (multiple)
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setDateFilter('today');
    setCustomStartDate('');
    setCustomEndDate('');
    setCurrentPage(1);
  };

  const activeFiltersCount = selectedCategories.length + (dateFilter !== 'today' ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-3 rounded-xl">
            <Receipt className="w-6 h-6 text-teal-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">Minhas Despesas</h2>
            <p className="text-sm text-gray-500">
              <Clock className="w-3.5 h-3.5 inline mr-1" />
              {dateFilter === 'today' && `Hoje: `}
              {dateFilter === 'week' && `Últimos 7 dias: `}
              {dateFilter === 'month' && `Último mês: `}
              {dateFilter === 'custom' && `Período: `}
              {dateFilter === 'all' && `Total: `}
              <span className="font-semibold text-teal-600">R$ {filteredTotal.toFixed(2)}</span>
              {' '}({filteredExpenses.length} {filteredExpenses.length === 1 ? 'despesa' : 'despesas'})
            </p>
          </div>
        </div>

        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
          title={isCollapsed ? 'Expandir' : 'Minimizar'}
        >
          {isCollapsed ? (
            <ChevronDown className="w-6 h-6 text-gray-600" />
          ) : (
            <ChevronUp className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="space-y-4 animate-slideDown">
          {/* Filter Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">{activeFiltersCount}</span>
              )}
            </button>
          </div>

      {/* Collapsible Filters Panel */}
      {showFilters && (
        <div className="mb-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 space-y-5">
          {/* Date Filters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Período
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
              <button
                onClick={() => { setDateFilter('today'); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                  dateFilter === 'today'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={() => { setDateFilter('week'); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                  dateFilter === 'week'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                7 Dias
              </button>
              <button
                onClick={() => { setDateFilter('month'); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                  dateFilter === 'month'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                30 Dias
              </button>
              <button
                onClick={() => { setDateFilter('all'); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                  dateFilter === 'all'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Tudo
              </button>
              <button
                onClick={() => { setDateFilter('custom'); setCurrentPage(1); }}
                className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                  dateFilter === 'custom'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Personalizado
              </button>
            </div>
            
            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-gray-300">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Data Inicial</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => { setCustomStartDate(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Data Final</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => { setCustomEndDate(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category Filters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Categorias {selectedCategories.length > 0 && `(${selectedCategories.length})`}
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Limpar Tudo
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {CATEGORIES.filter(cat => cat.value !== 'all').map((cat) => {
                const count = expenses.filter(e => e.category === cat.value).length;
                const isSelected = selectedCategories.includes(cat.value);
                
                return (
                  <button
                    key={cat.value}
                    onClick={() => toggleCategory(cat.value)}
                    disabled={count === 0}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md scale-105'
                        : count > 0
                        ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="text-xs leading-tight">{cat.label}</div>
                      {count > 0 && (
                        <div className={`text-xs font-bold ${
                          isSelected ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {count}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4">
            <TrendingDown className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            Nenhuma despesa encontrada
          </h3>
          <p className="text-sm text-gray-500">
            {activeFiltersCount > 0 
              ? 'Tente ajustar os filtros para ver mais resultados'
              : 'Adicione sua primeira despesa para começar'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onUpdate={onExpenseUpdated}
                onDelete={onExpenseDeleted}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">{startIndex + 1}</span> a{' '}
                <span className="font-semibold">{Math.min(endIndex, filteredExpenses.length)}</span> de{' '}
                <span className="font-semibold">{filteredExpenses.length}</span> despesas
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>
      )}
    </div>
  );
}
