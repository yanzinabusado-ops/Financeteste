import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, AlertCircle, CheckCircle, X, Zap, Target, Calendar } from 'lucide-react';
import type { Expense } from '../types/database';
import type { BehaviorInsight } from '../lib/analytics';
import {
  generateBehaviorInsights,
  prioritizeAndFilterInsights,
  generateInsightKey
} from '../lib/analytics';
import { dismissInsight, fetchActiveDismissedInsights } from '../lib/budgets';
import { useDebounce } from '../hooks/useDebounce';

interface BehaviorInsightsProps {
  expenses: Expense[];
}

export default function BehaviorInsights({ expenses }: BehaviorInsightsProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<BehaviorInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounce expenses to avoid regeneration on rapid expense additions (300ms delay)
  const debouncedExpenses = useDebounce(expenses, 300);

  // Memoize current month expenses filtering
  const currentMonthExpenses = useMemo(() => {
    const currentDate = new Date();
    const currentMonthYear = currentDate.toISOString().slice(0, 7);
    
    return debouncedExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonthYear = expenseDate.toISOString().slice(0, 7);
      return expenseMonthYear === currentMonthYear;
    });
  }, [debouncedExpenses]);

  // Memoize insight generation (expensive calculation)
  const generatedInsights = useMemo(() => {
    return generateBehaviorInsights(currentMonthExpenses);
  }, [currentMonthExpenses]);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user, generatedInsights]);

  const loadInsights = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Fetch dismissed insights to filter out
      const dismissedInsights = await fetchActiveDismissedInsights(user.id);

      // Prioritize and filter insights (max 3, sorted by priority, filtered by dismissals)
      const filteredInsights = prioritizeAndFilterInsights(generatedInsights, dismissedInsights);

      setInsights(filteredInsights);
    } catch (error) {
      console.error('Error loading behavior insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (insight: BehaviorInsight) => {
    if (!user) return;

    const insightKey = generateInsightKey(insight);

    try {
      // Dismiss the insight with 24-hour cooldown
      await dismissInsight(user.id, insightKey);

      // Remove from local state
      setInsights(insights.filter(i => generateInsightKey(i) !== insightKey));
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  // Get icon based on insight type
  const getInsightIcon = (type: BehaviorInsight['type']) => {
    switch (type) {
      case 'spike':
        return <AlertCircle className="w-6 h-6" />;
      case 'consistent':
        return <CheckCircle className="w-6 h-6" />;
      case 'recurring':
        return <Calendar className="w-6 h-6" />;
      case 'dominant_category':
        return <Target className="w-6 h-6" />;
      default:
        return <TrendingUp className="w-6 h-6" />;
    }
  };

  // Get styling based on priority
  const getInsightStyle = (priority: number) => {
    if (priority >= 3) {
      // Critical (priority 3+)
      return {
        container: 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 shadow-red-100',
        icon: 'text-red-600 bg-red-100',
        badge: 'bg-red-600 text-white',
        text: 'text-red-900'
      };
    } else if (priority === 2) {
      // Warning (priority 2)
      return {
        container: 'bg-gradient-to-br from-amber-50 to-yellow-100 border-yellow-300 shadow-yellow-100',
        icon: 'text-amber-600 bg-amber-100',
        badge: 'bg-amber-600 text-white',
        text: 'text-amber-900'
      };
    } else {
      // Info (priority 1)
      return {
        container: 'bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-300 shadow-emerald-100',
        icon: 'text-emerald-600 bg-emerald-100',
        badge: 'bg-emerald-600 text-white',
        text: 'text-emerald-900'
      };
    }
  };

  // Get priority indicator for colorblind accessibility
  const getPriorityIndicator = (priority: number) => {
    if (priority >= 3) {
      return { symbol: '⚠️', label: 'Atenção' };
    } else if (priority === 2) {
      return { symbol: '💡', label: 'Dica' };
    } else {
      return { symbol: '✅', label: 'Parabéns' };
    }
  };

  if (loading || insights.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 p-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            Insights em Análise
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Continue registrando suas despesas para receber insights personalizados sobre seus hábitos financeiros
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-live="polite">
      {insights.map((insight, index) => {
        const priorityIndicator = getPriorityIndicator(insight.priority);
        const styles = getInsightStyle(insight.priority);
        
        return (
          <div
            key={`${generateInsightKey(insight)}-${index}`}
            className={`
              rounded-2xl border-2 p-5 relative
              transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
              ${styles.container}
            `}
          >
            <button
              onClick={() => handleDismiss(insight)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/10 transition-colors"
              aria-label={`Dispensar insight: ${insight.message}`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              {/* Icon */}
              <div className={`flex-shrink-0 p-3 rounded-xl ${styles.icon}`} aria-hidden="true">
                {getInsightIcon(insight.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles.badge}`}>
                    <span aria-hidden="true">{priorityIndicator.symbol}</span>
                    <span>{priorityIndicator.label}</span>
                  </span>
                </div>
                
                {/* Message */}
                <p className={`text-base font-semibold leading-relaxed ${styles.text}`}>
                  {insight.message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
