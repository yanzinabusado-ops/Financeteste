import { useState, useEffect, useRef } from 'react';
import { Lightbulb, TrendingUp, BarChart3, Target } from 'lucide-react';
import type { Expense } from '../types/database';
import FinancialInsights from './FinancialInsights';
import BehaviorInsights from './BehaviorInsights';
import ComparisonInsights from './ComparisonInsights';
import MonthlyProjectionCard from './MonthlyProjectionCard';

interface InsightsHubProps {
  income: number;
  expenses: Expense[];
  currentBalance: number;
  disableAutoplay?: boolean;
}

type TabType = 'overview' | 'behavior' | 'comparison' | 'projection';

export default function InsightsHub({ income, expenses, currentBalance, disableAutoplay = false }: InsightsHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isPaused, setIsPaused] = useState(false);
  const carouselIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Visão Geral',
      icon: Lightbulb,
      activeClass: 'border-cyan-500 text-cyan-600',
    },
    {
      id: 'behavior' as TabType,
      label: 'Comportamento',
      icon: TrendingUp,
      activeClass: 'border-blue-500 text-blue-600',
    },
    {
      id: 'comparison' as TabType,
      label: 'Comparação',
      icon: BarChart3,
      activeClass: 'border-purple-500 text-purple-600',
    },
    {
      id: 'projection' as TabType,
      label: 'Projeção',
      icon: Target,
      activeClass: 'border-emerald-500 text-emerald-600',
    },
  ];

  // Auto-play carousel effect
  useEffect(() => {
    // Se autoplay está desabilitado (durante tour), não inicia carrossel
    if (disableAutoplay) {
      return;
    }

    // Limpa intervalos anteriores
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
      carouselIntervalRef.current = null;
    }

    // Se está pausado, não inicia o carrossel
    if (isPaused) {
      return;
    }

    // Inicia o carrossel: troca a cada 8 segundos
    carouselIntervalRef.current = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = tabs.findIndex((tab) => tab.id === current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex].id;
      });
    }, 8000);

    // Cleanup
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, [isPaused, disableAutoplay]);

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    
    // Pausa o carrossel
    setIsPaused(true);
    
    // Limpa timeout anterior se existir
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    
    // Após 30 segundos, retoma o carrossel automaticamente
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 30000); // 30 segundos
  };

  // Cleanup dos timeouts quando componente desmonta
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Tabs Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap
                  transition-all duration-200 border-b-2 flex-1 sm:flex-none relative
                  ${isActive
                    ? `${tab.activeClass} bg-white`
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {/* Progress bar para aba ativa durante autoplay */}
                {isActive && !isPaused && (
                  <div className="absolute bottom-0 left-0 h-0.5 bg-current animate-progress" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            <FinancialInsights income={income} expenses={expenses} />
          </div>
        )}

        {activeTab === 'behavior' && (
          <div className="animate-fadeIn">
            <BehaviorInsights expenses={expenses} />
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="animate-fadeIn">
            <ComparisonInsights expenses={expenses} />
          </div>
        )}

        {activeTab === 'projection' && (
          <div className="animate-fadeIn">
            <MonthlyProjectionCard
              expenses={expenses}
              currentBalance={currentBalance}
            />
          </div>
        )}
      </div>
    </div>
  );
}
