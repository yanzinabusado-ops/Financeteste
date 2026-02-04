import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { getCategoryBreakdown } from '../lib/insights';
import type { Expense } from '../types/database';
import { BarChart3 } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpensesChartProps {
  expenses: Expense[];
}

export default function ExpensesChart({ expenses }: ExpensesChartProps) {
  const chartRef = useRef(null);
  const categoryBreakdown = getCategoryBreakdown(expenses);

  const data = {
    labels: categoryBreakdown.map((cat) => `${cat.icon} ${cat.label}`),
    datasets: [
      {
        label: 'Gastos por Categoria',
        data: categoryBreakdown.map((cat) => parseFloat(cat.amount.toFixed(2))),
        backgroundColor: categoryBreakdown.map((cat) => cat.color),
        borderColor: categoryBreakdown.map(() => '#ffffff'),
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 12,
            weight: '500',
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context) {
            const value = context.parsed;
            const percentage = categoryBreakdown[context.dataIndex].percentage;
            return `R$ ${value.toFixed(2)} (${percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100 h-full flex flex-col items-center justify-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-center">Adicione despesas para ver o gráfico de distribuição</p>
      </div>
    );
  }

  const totalExpenses = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 h-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-teal-100 p-2 rounded-lg">
            <BarChart3 className="w-5 h-5 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Gastos por Categoria</h2>
        </div>
        <p className="text-sm text-gray-600">Total: <span className="font-semibold text-teal-600">R$ {totalExpenses.toFixed(2)}</span></p>
      </div>

      <div className="flex-1 flex items-center justify-center animate-fadeIn">
        <div className="w-full h-64">
          <Pie ref={chartRef} data={data} options={options} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categoryBreakdown.map((category) => (
          <div key={category.category} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-teal-300 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm font-medium text-gray-700">{category.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">R$ {category.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  backgroundColor: category.color,
                  width: `${category.percentage}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
