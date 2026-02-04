import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  income: number;
  totalExpenses: number;
  balance: number;
}

export default function SummaryCards({ income, totalExpenses, balance }: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-gray-500">Renda Mensal</span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(income)}</p>
          <p className="text-sm text-gray-500">Receita total do mês</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-red-100 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-red-100 p-3 rounded-xl">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
          <span className="text-sm font-medium text-gray-500">Total de Gastos</span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-gray-800">{formatCurrency(totalExpenses)}</p>
          <p className="text-sm text-gray-500">Despesas acumuladas</p>
        </div>
      </div>

      <div className={`bg-white rounded-2xl shadow-lg p-6 border transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        balance >= 0 ? 'border-teal-100' : 'border-orange-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${
            balance >= 0 ? 'bg-teal-100' : 'bg-orange-100'
          }`}>
            <Wallet className={`w-6 h-6 ${
              balance >= 0 ? 'text-teal-600' : 'text-orange-600'
            }`} />
          </div>
          <span className="text-sm font-medium text-gray-500">Saldo Restante</span>
        </div>
        <div className="space-y-1">
          <p className={`text-3xl font-bold ${
            balance >= 0 ? 'text-teal-600' : 'text-orange-600'
          }`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-sm text-gray-500">
            {balance >= 0 ? 'Você está no positivo' : 'Atenção ao orçamento'}
          </p>
        </div>
      </div>
    </div>
  );
}
