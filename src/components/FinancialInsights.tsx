import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { expenseService } from '../services/supabase';
import { generateInsights, getPreviousMonthYear, getCurrentMonthYear } from '../lib/insights';
import type { FinancialInsight } from '../lib/insights';
import type { Expense } from '../types/database';
import { AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';

interface FinancialInsightsProps {
  income: number;
  expenses: Expense[];
}

export default function FinancialInsights({ income, expenses }: FinancialInsightsProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [income, expenses, user]);

  const loadInsights = async () => {
    if (!user || income === 0) {
      setInsights([]);
      return;
    }

    setLoading(true);

    try {
      const previousMonthYear = getPreviousMonthYear();
      const previousExpenses = await expenseService.getByMonth(user.id, previousMonthYear);
      const newInsights = generateInsights(income, expenses, previousExpenses);
      setInsights(newInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return null;
  }

  const getInsightIcon = (insight: FinancialInsight) => {
    switch (insight.type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      default:
        return null;
    }
  };

  const getInsightStyles = (insight: FinancialInsight) => {
    switch (insight.type) {
      case 'warning':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          title: 'text-red-900',
          text: 'text-red-800',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          title: 'text-blue-900',
          text: 'text-blue-800',
        };
      case 'success':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          title: 'text-emerald-900',
          text: 'text-emerald-800',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          title: 'text-gray-900',
          text: 'text-gray-800',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-cyan-100 p-2 rounded-lg">
          <Lightbulb className="w-5 h-5 text-cyan-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Insights do Mês</h2>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const styles = getInsightStyles(insight);
          return (
            <div
              key={index}
              className={`${styles.bg} ${styles.border} border rounded-lg p-4 animate-slideDown transition-all duration-200 hover:shadow-md`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getInsightIcon(insight)}</div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm ${styles.title} mb-1`}>
                    {insight.icon} {insight.title}
                  </h3>
                  <p className={`text-sm ${styles.text} leading-relaxed`}>{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Insights atualizados automaticamente com suas despesas
        </p>
      </div>
    </div>
  );
}
