import { useState, useMemo } from 'react';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';
import type { Expense } from '../types/database';
import { calculateMonthlyProjection, formatProjectionMessage, formatCurrency } from '../lib/analytics';
import { useDebounce } from '../hooks/useDebounce';

interface MonthlyProjectionCardProps {
  expenses: Expense[];
  currentBalance: number;
}

export default function MonthlyProjectionCard({ expenses, currentBalance }: MonthlyProjectionCardProps) {
  const [currentDate] = useState(new Date());

  // Debounce expenses to avoid recalculation on rapid expense additions (300ms delay)
  const debouncedExpenses = useDebounce(expenses, 300);

  // Calculate projection using analytics service
  // Memoize to avoid recalculation on every render
  const projection = useMemo(() => {
    return calculateMonthlyProjection(debouncedExpenses, currentBalance, currentDate);
  }, [debouncedExpenses, currentBalance, currentDate]);

  // Format the projection message
  const projectionMessage = useMemo(() => {
    return formatProjectionMessage(projection);
  }, [projection]);

  return (
    <div className="space-y-4">
      {/* Main projection message */}
      <div className="space-y-1">
        <p 
          className="text-lg font-semibold text-gray-800"
          aria-live="polite"
          aria-atomic="true"
        >
          {projectionMessage}
        </p>
      </div>

      {/* Additional details when projection is available */}
      {projection && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500">
              <DollarSign className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-medium">Gasto Diário Médio</span>
            </div>
            <p className="text-sm font-semibold text-gray-700" aria-label={`Gasto diário médio: ${formatCurrency(projection.averageDailySpending)}`}>
              {formatCurrency(projection.averageDailySpending)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-medium">Dias Restantes</span>
            </div>
            <p className="text-sm font-semibold text-gray-700" aria-label={`${projection.remainingDays} ${projection.remainingDays === 1 ? 'dia' : 'dias'} restantes no mês`}>
              {projection.remainingDays} {projection.remainingDays === 1 ? 'dia' : 'dias'}
            </p>
          </div>
        </div>
      )}

      {/* Confidence indicator */}
      {projection && (
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Confiança da projeção:</span>
            <span 
              className={`font-medium flex items-center gap-1 ${
                projection.confidence === 'high' ? 'text-green-600' :
                projection.confidence === 'medium' ? 'text-yellow-600' :
                'text-orange-600'
              }`}
              aria-label={`Nível de confiança: ${
                projection.confidence === 'high' ? 'Alta' :
                projection.confidence === 'medium' ? 'Média' :
                'Baixa'
              }`}
            >
              {projection.confidence === 'high' && <span aria-hidden="true">●●●</span>}
              {projection.confidence === 'medium' && <span aria-hidden="true">●●○</span>}
              {projection.confidence === 'low' && <span aria-hidden="true">●○○</span>}
              <span>
                {projection.confidence === 'high' ? 'Alta' :
                 projection.confidence === 'medium' ? 'Média' :
                 'Baixa'}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
