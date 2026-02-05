import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Income, Expense } from '../types/database';
import IncomeCard from './IncomeCard';
import ExpensesList from './ExpensesList';
import AddExpense from './AddExpense';
import SummaryCards from './SummaryCards';
import ExpensesChart from './ExpensesChart';
import FinancialInsights from './FinancialInsights';
import TopExpenses from './TopExpenses';
import { LogOut, Wallet } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [income, setIncome] = useState<Income | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonthYear = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);

    const [incomeResult, expensesResult] = await Promise.all([
      supabase
        .from('income')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonthYear)
        .maybeSingle(),
      supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
    ]);

    if (incomeResult.data) {
      setIncome(incomeResult.data);
    }

    if (expensesResult.data) {
      setExpenses(expensesResult.data);
    }

    setLoading(false);
  };

  const handleIncomeUpdate = (newIncome: Income) => {
    setIncome(newIncome);
  };

  const handleExpenseAdded = (newExpense: Expense) => {
    setExpenses([newExpense, ...expenses]);
  };

  const handleExpenseUpdated = (updatedExpense: Expense) => {
    setExpenses(expenses.map(exp =>
      exp.id === updatedExpense.id ? updatedExpense : exp
    ));
  };

  const handleExpenseDeleted = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const balance = (income?.amount || 0) - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl shadow-md">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                FinanceControl
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.email}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <SummaryCards
              income={income?.amount || 0}
              totalExpenses={totalExpenses}
              balance={balance}
            />

            <FinancialInsights income={income?.amount || 0} expenses={expenses} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <IncomeCard
                  income={income}
                  monthYear={currentMonthYear}
                  onUpdate={handleIncomeUpdate}
                />
              </div>

              <div className="lg:col-span-2 space-y-6">
                <AddExpense onExpenseAdded={handleExpenseAdded} />
                <ExpensesList
                  expenses={expenses}
                  onExpenseUpdated={handleExpenseUpdated}
                  onExpenseDeleted={handleExpenseDeleted}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpensesChart expenses={expenses} />
              <TopExpenses expenses={expenses} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
