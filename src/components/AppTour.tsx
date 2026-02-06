import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="summary-cards"]',
    title: '💰 Resumo Financeiro',
    description: 'Aqui você vê seu saldo atual, total de receitas e despesas do mês. É o seu painel de controle principal!',
    position: 'bottom',
  },
  {
    target: '[data-tour="insights-hub"]',
    title: '🧠 Hub de Insights',
    description: 'Insights inteligentes sobre seus gastos! Navegue pelas abas para ver análises, comparações e comportamentos financeiros.',
    position: 'bottom',
  },
  {
    target: '[data-tour="income-card"]',
    title: '💵 Sua Renda',
    description: 'Adicione ou atualize sua renda mensal aqui. Isso ajuda a calcular seu saldo e fazer projeções.',
    position: 'right',
  },
  {
    target: '[data-tour="add-expense"]',
    title: '➕ Adicionar Despesa',
    description: 'Registre suas despesas rapidamente! Escolha categoria, valor, data e descrição.',
    position: 'left',
  },
  {
    target: '[data-tour="expenses-list"]',
    title: '📋 Lista de Despesas',
    description: 'Todas as suas despesas ficam aqui! Use os filtros para buscar por período ou categoria. Você pode editar ou excluir qualquer despesa.',
    position: 'top',
  },
  {
    target: '[data-tour="category-chart"]',
    title: '📊 Gastos por Categoria',
    description: 'Visualize onde seu dinheiro está indo! Configure limites de orçamento para cada categoria e acompanhe seu progresso.',
    position: 'top',
  },
  {
    target: '[data-tour="top-expenses"]',
    title: '🔝 Maiores Despesas',
    description: 'Veja suas maiores despesas do mês. Identifique onde você pode economizar!',
    position: 'top',
  },
];

interface AppTourProps {
  onComplete: () => void;
}

export default function AppTour({ onComplete }: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const currentTourStep = tourSteps[currentStep];

  const updatePositions = () => {
    const element = document.querySelector(currentTourStep.target) as HTMLElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    // Update highlight position (using viewport coordinates)
    setHighlightPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    // Calculate tooltip position (using viewport coordinates)
    let top = 0;
    let left = 0;
    const tooltipWidth = 384; // max-w-sm
    const padding = 20;

    switch (currentTourStep.position) {
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = rect.top - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + padding;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - tooltipWidth - padding;
        break;
    }

    // Keep tooltip within viewport
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }
    if (top < padding) top = padding;

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (!isVisible) return;

    // Block scroll during tour
    document.body.style.overflow = 'hidden';

    const element = document.querySelector(currentTourStep.target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      
      // Scroll to element smoothly
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Update positions after scroll completes
      setTimeout(() => {
        updatePositions();
      }, 500);
    }

    // Update positions on resize only (not scroll since it's blocked)
    const handleUpdate = () => updatePositions();
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      // Re-enable scroll when tour ends
      document.body.style.overflow = '';
    };
  }, [currentStep, currentTourStep, isVisible]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('hasCompletedTour', 'true');
    onComplete();
  };

  if (!isVisible || !targetElement) return null;

  return (
    <>
      {/* Overlay - blocks all interactions */}
      <div 
        className="fixed inset-0 bg-black/50 z-[90] transition-opacity duration-300"
        style={{ touchAction: 'none' }}
      />

      {/* Highlight */}
      <div
        className="fixed z-[95] pointer-events-none transition-all duration-300"
        style={{
          top: `${highlightPosition.top - 8}px`,
          left: `${highlightPosition.left - 8}px`,
          width: `${highlightPosition.width + 16}px`,
          height: `${highlightPosition.height + 16}px`,
          boxShadow: '0 0 0 4px rgba(20, 184, 166, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[100] max-w-sm transition-all duration-300"
        style={{
          top: currentTourStep.position === 'top' || currentTourStep.position === 'bottom'
            ? `${tooltipPosition.top}px`
            : `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: currentTourStep.position === 'left' || currentTourStep.position === 'right'
            ? 'translateY(-50%)'
            : currentTourStep.position === 'top'
            ? 'translateY(-100%)'
            : 'translateY(0)',
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-teal-500 animate-slideDown">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 pr-8">
              {currentTourStep.title}
            </h3>
            <button
              onClick={handleSkip}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Pular tour"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {currentTourStep.description}
          </p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Passo {currentStep + 1} de {tourSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-600 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
            >
              Pular Tour
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Concluir</span>
                  </>
                ) : (
                  <>
                    <span>Próximo</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div
          className={`absolute w-0 h-0 border-8 ${
            currentTourStep.position === 'bottom'
              ? 'border-transparent border-b-white -top-4 left-1/2 -translate-x-1/2'
              : currentTourStep.position === 'top'
              ? 'border-transparent border-t-white -bottom-4 left-1/2 -translate-x-1/2'
              : currentTourStep.position === 'right'
              ? 'border-transparent border-r-white -left-4 top-1/2 -translate-y-1/2'
              : 'border-transparent border-l-white -right-4 top-1/2 -translate-y-1/2'
          }`}
        />
      </div>
    </>
  );
}
