import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, TrendingUp, TrendingDown, Award, Sparkles, ArrowRight, DollarSign } from 'lucide-react';
import type { Expense } from '../types/database';

interface MonthTransitionModalProps {
  expenses: Expense[];
  currentBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

export default function MonthTransitionModal({ 
  expenses, 
  currentBalance,
  onBalanceUpdate 
}: MonthTransitionModalProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'summary' | 'newMonth'>('summary');
  const [newSalary, setNewSalary] = useState('');
  const [loading, setLoading] = useState(false);

  // Get current and previous month
  const currentDate = new Date();
  const currentMonthYear = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const previousDate = new Date(currentDate);
  previousDate.setMonth(previousDate.getMonth() - 1);
  const previousMonthYear = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`;

  // Check if we need to show the modal
  useEffect(() => {
    if (!user) return;

    const checkMonthTransition = async () => {
      // Check if user has seen the transition for this month
      const { data } = await supabase
        .from('month_transitions')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear)
        .single();

      // If no record exists and it's a new month, show modal
      if (!data && currentDate.getDate() <= 5) {
        // Only show in first 5 days of month
        const previousMonthExpenses = expenses.filter(exp => 
          exp.date.startsWith(previousMonthYear)
        );
        
        if (previousMonthExpenses.length > 0) {
          setShowModal(true);
        }
      }
    };

    checkMonthTransition();
  }, [user, currentMonthYear, previousMonthYear, expenses, currentDate]);

  // Calculate previous month stats
  const previousMonthExpenses = expenses.filter(exp => 
    exp.date.startsWith(previousMonthYear)
  );

  const previousMonthTotal = previousMonthExpenses.reduce((sum, exp) => 
    sum + Number(exp.amount), 0
  );

  const categoryBreakdown = previousMonthExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b - a)[0];

  const categoryIcons: Record<string, string> = {
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    health: '💊',
    education: '📚',
    bills: '💡',
    shopping: '🛍️',
    other: '📦',
  };

  const categoryNames: Record<string, string> = {
    food: 'Alimentação',
    transport: 'Transporte',
    entertainment: 'Lazer',
    health: 'Saúde',
    education: 'Educação',
    bills: 'Contas',
    shopping: 'Compras',
    other: 'Outros',
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);

    try {
      // Update balance if new salary provided
      if (newSalary && !isNaN(Number(newSalary))) {
        const newBalance = currentBalance + Number(newSalary);
        onBalanceUpdate(newBalance);
      }

      // Mark transition as seen
      await supabase
        .from('month_transitions')
        .insert({
          user_id: user.id,
          month_year: currentMonthYear,
          previous_month_total: previousMonthTotal,
          previous_month_expenses_count: previousMonthExpenses.length
        } as any);

      setShowModal(false);
    } catch (error) {
      console.error('Error completing month transition:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {step === 'summary' ? (
          <div className="p-8">
            {/* Header with celebration */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4 animate-bounce">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Novo Mês Começou! 🎉
              </h2>
              <p className="text-gray-600">
                Veja como foi {monthNames[previousDate.getMonth()]} de {previousDate.getFullYear()}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Total Spent */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-5 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-semibold text-red-900">Total Gasto</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  R$ {previousMonthTotal.toFixed(2)}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {previousMonthExpenses.length} despesas
                </p>
              </div>

              {/* Balance */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border-2 border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-900">Saldo Atual</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  R$ {currentBalance.toFixed(2)}
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  {currentBalance >= 0 ? 'Positivo' : 'Negativo'}
                </p>
              </div>
            </div>

            {/* Top Category */}
            {topCategory && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200 mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{categoryIcons[topCategory[0]]}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">
                        Categoria Campeã
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-800">
                      {categoryNames[topCategory[0]]}
                    </p>
                    <p className="text-sm text-blue-600">
                      R$ {topCategory[1].toFixed(2)} ({((topCategory[1] / previousMonthTotal) * 100).toFixed(0)}% do total)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Motivational Message */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 mb-6">
              <p className="text-center text-purple-900 font-semibold">
                {currentBalance >= 0 
                  ? '🎊 Parabéns! Você terminou o mês no positivo!'
                  : '💪 Novo mês, novas oportunidades! Vamos melhorar juntos!'}
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setStep('newMonth')}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Configurar Novo Mês</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="p-8">
            {/* New Month Setup */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full mb-4">
                <Calendar className="w-10 h-10 text-teal-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Bem-vindo a {monthNames[currentDate.getMonth()]}! 🌟
              </h2>
              <p className="text-gray-600">
                Configure seu novo mês financeiro
              </p>
            </div>

            {/* Current Balance Display */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border-2 border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Saldo Atual</p>
                <p className="text-3xl font-bold text-gray-800">
                  R$ {currentBalance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Salary Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                💰 Recebeu salário este mês?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl text-lg font-semibold focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Deixe em branco se não recebeu nada ainda
              </p>
              
              {newSalary && !isNaN(Number(newSalary)) && Number(newSalary) > 0 && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="text-sm text-emerald-800">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Novo saldo: <span className="font-bold">
                      R$ {(currentBalance + Number(newSalary)).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <p className="text-sm text-blue-800">
                ℹ️ Seus dados anteriores estão salvos e podem ser acessados no histórico a qualquer momento!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('summary')}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-4 rounded-xl font-bold hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 shadow-lg"
              >
                {loading ? 'Salvando...' : 'Começar Novo Mês'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
