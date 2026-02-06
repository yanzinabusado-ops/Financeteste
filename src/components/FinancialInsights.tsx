import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getPreviousMonthYear, getCurrentMonthYear } from '../lib/insights';
import { 
  generateBehaviorInsights, 
  prioritizeAndFilterInsights,
  calculateMonthComparison,
  formatComparisonMessage
} from '../lib/analytics';
import type { FinancialInsight } from '../lib/insights';
import type { BehaviorInsight } from '../lib/analytics';
import type { Expense } from '../types/database';
import { AlertCircle, Lightbulb, TrendingUp } from 'lucide-react';

interface FinancialInsightsProps {
  income: number;
  expenses: Expense[];
}

/**
 * Convert BehaviorInsight from analytics service to FinancialInsight for display
 * Maps new insight types to existing UI types and icons
 */
function convertBehaviorInsightToFinancialInsight(behaviorInsight: BehaviorInsight): FinancialInsight {
  // Map insight types to UI display types
  let type: 'warning' | 'info' | 'success';
  let title: string;
  let icon: string;

  switch (behaviorInsight.type) {
    case 'recurring':
      type = 'info';
      title = 'Despesa Recorrente';
      icon = '🔄';
      break;
    case 'dominant_category':
      type = 'warning';
      title = 'Categoria Dominante';
      icon = '📊';
      break;
    case 'spike':
      type = 'warning';
      title = 'Gasto Elevado';
      icon = '⚠️';
      break;
    case 'consistent':
      type = 'success';
      title = 'Gastos Consistentes';
      icon = '✅';
      break;
    default:
      type = 'info';
      title = 'Insight';
      icon = '💡';
  }

  return {
    type,
    title,
    message: behaviorInsight.message,
    icon
  };
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
      const allInsights: FinancialInsight[] = [];
      const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
      const expensePercentage = income > 0 ? (totalExpenses / income) * 100 : 0;

      // 1. Insight principal sobre gastos vs renda (apenas 1)
      if (expensePercentage > 80) {
        allInsights.push({
          type: 'warning',
          title: 'Atenção com Orçamento',
          message: `Seus gastos atingiram ${expensePercentage.toFixed(1)}% da sua renda. Considere reduzir despesas.`,
          icon: '⚠️',
        });
      } else if (expensePercentage > 60) {
        allInsights.push({
          type: 'info',
          title: 'Gastos Moderados',
          message: `Você gastou ${expensePercentage.toFixed(1)}% da sua renda. Mantenha o bom trabalho!`,
          icon: '💡',
        });
      } else if (totalExpenses > 0) {
        allInsights.push({
          type: 'success',
          title: 'Excelente Controle',
          message: `Você gastou apenas ${expensePercentage.toFixed(1)}% da sua renda. Parabéns!`,
          icon: '✅',
        });
      }

      // 2. Despesas individuais significativas (máximo 2)
      const highExpenses = expenses
        .filter((exp) => income > 0 && Number(exp.amount) > income * 0.15)
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 2); // Limita a 2 despesas

      highExpenses.forEach((exp) => {
        const percentage = income > 0 ? (Number(exp.amount) / income) * 100 : 0;
        allInsights.push({
          type: 'warning',
          title: 'Despesa Significativa',
          message: `"${exp.description}" representa ${percentage.toFixed(1)}% da sua renda mensal.`,
          icon: '⚠️',
        });
      });

      // 3. Comparação com mês anterior (apenas se houver dados)
      const previousMonthYear = getPreviousMonthYear();
      const currentMonthYear = getCurrentMonthYear();

      const { data: previousExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', `${previousMonthYear}-01`)
        .lt('date', `${currentMonthYear}-01`);

      if (previousExpenses && previousExpenses.length > 0) {
        const comparison = calculateMonthComparison(expenses, previousExpenses);
        const comparisonMessage = formatComparisonMessage(comparison);
        
        if (comparisonMessage && comparison) {
          allInsights.push({
            type: comparison.isIncrease ? 'warning' : 'success',
            title: comparison.isIncrease ? 'Gastos Aumentaram' : 'Gastos Diminuíram',
            message: comparisonMessage,
            icon: comparison.isIncrease ? '📈' : '📉',
          });
        }
      }

      // 4. Limita a 3 insights no total para não poluir
      const finalInsights = allInsights.slice(0, 3);
      
      setInsights(finalInsights);
    } catch (error) {
      console.error('Erro ao carregar insights:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Adicione despesas para ver insights personalizados</p>
      </div>
    );
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
    <div className="space-y-4">
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

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Insights atualizados automaticamente
        </p>
      </div>
    </div>
  );
}
