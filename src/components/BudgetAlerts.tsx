import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, XCircle, X } from 'lucide-react';
import type { Expense } from '../types/database';
import type { BudgetAlert } from '../lib/analytics';
import { detectBudgetAlerts } from '../lib/analytics';
import { fetchBudgetLimits, dismissInsight, fetchActiveDismissedInsights } from '../lib/budgets';
import { useDebounce } from '../hooks/useDebounce';

interface BudgetAlertsProps {
  expenses: Expense[];
}

export default function BudgetAlerts({ expenses }: BudgetAlertsProps) {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetLimits, setBudgetLimits] = useState<any[]>([]);

  // Debounce expenses to avoid recalculation on rapid expense additions (300ms delay)
  const debouncedExpenses = useDebounce(expenses, 300);

  // Get current month-year for budget lookup (memoized)
  const currentMonthYear = useMemo(() => {
    return new Date().toISOString().slice(0, 7);
  }, []);

  // Memoize current month expenses filtering
  const currentMonthExpenses = useMemo(() => {
    return debouncedExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonthYear = expenseDate.toISOString().slice(0, 7);
      return expenseMonthYear === currentMonthYear;
    });
  }, [debouncedExpenses, currentMonthYear]);

  // Memoize alert detection (expensive calculation)
  const generatedAlerts = useMemo(() => {
    if (budgetLimits.length === 0) return [];
    return detectBudgetAlerts(currentMonthExpenses, budgetLimits);
  }, [currentMonthExpenses, budgetLimits]);

  useEffect(() => {
    if (user) {
      loadBudgetLimits();
    }
  }, [user, currentMonthYear]);

  useEffect(() => {
    if (user && budgetLimits.length > 0) {
      loadAlerts();
    }
  }, [user, generatedAlerts]);

  const loadBudgetLimits = async () => {
    if (!user) return;

    try {
      // Fetch budget limits for current month (cache this data)
      const limits = await fetchBudgetLimits(user.id, currentMonthYear);
      setBudgetLimits(limits);
    } catch (error) {
      console.error('Error loading budget limits:', error);
    }
  };

  const loadAlerts = async () => {
    if (!user) return;

    setLoading(true);

    try {

      // Fetch dismissed insights to filter out
      const dismissedInsights = await fetchActiveDismissedInsights(user.id);
      const dismissedKeys = new Set(dismissedInsights.map(d => d.insight_key));

      // Filter out dismissed alerts
      const filteredAlerts = generatedAlerts.filter(alert => {
        const alertKey = generateAlertKey(alert);
        return !dismissedKeys.has(alertKey);
      });

      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Error loading budget alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (alert: BudgetAlert) => {
    if (!user) return;

    const alertKey = generateAlertKey(alert);

    try {
      // Dismiss the insight with 24-hour cooldown
      await dismissInsight(user.id, alertKey);

      // Remove from local state
      setAlerts(alerts.filter(a => generateAlertKey(a) !== alertKey));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  // Generate a unique key for each alert for dismissal tracking
  const generateAlertKey = (alert: BudgetAlert): string => {
    return `budget_alert_${alert.category}_${alert.level}_${currentMonthYear}`;
  };

  if (loading || alerts.length === 0) {
    return null;
  }

  return (
    <aside 
      className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md"
      role="region"
      aria-label="Alertas de orçamento"
      aria-live="polite"
    >
      {alerts.map((alert, index) => (
        <article
          key={`${alert.category}-${alert.level}-${index}`}
          className={`
            rounded-lg shadow-lg p-4 pr-12 relative
            backdrop-blur-sm border-l-4 animate-slide-in
            ${alert.level === 'warning'
              ? 'bg-yellow-50/95 border-yellow-500 text-yellow-900'
              : 'bg-red-50/95 border-red-500 text-red-900'
            }
          `}
          role="alert"
          aria-labelledby={`alert-title-${index}`}
        >
          <button
            onClick={() => handleDismiss(alert)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/10 transition-colors"
            aria-label={`Dispensar alerta de ${alert.category}`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5" aria-hidden="true">
              {alert.level === 'warning' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p id={`alert-title-${index}`} className="font-semibold text-sm mb-1 flex items-center gap-1">
                {alert.level === 'warning' ? (
                  <>
                    <span aria-hidden="true">!</span>
                    <span>Atenção</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">⚠</span>
                    <span>Limite Excedido</span>
                  </>
                )}
              </p>
              <p className="text-sm">
                <span className="font-medium">{alert.category}</span>:{' '}
                R$ {alert.spent.toFixed(2)} de R$ {alert.limit.toFixed(2)}
              </p>
              <p className="text-xs mt-1 opacity-90 flex items-center gap-1">
                <span>{alert.percentage.toFixed(0)}% do orçamento utilizado</span>
                {alert.level === 'warning' ? (
                  <span className="font-semibold">(≥80%)</span>
                ) : (
                  <span className="font-semibold">(≥100%)</span>
                )}
              </p>
            </div>
          </div>
        </article>
      ))}
    </aside>
  );
}
