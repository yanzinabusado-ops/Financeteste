import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Wallet, Target, Zap } from 'lucide-react';

interface WelcomeAnimationProps {
  userName?: string;
  onComplete: () => void;
}

export default function WelcomeAnimation({ userName, onComplete }: WelcomeAnimationProps) {
  const [step, setStep] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000),     // Logo aparece (1s)
      setTimeout(() => setStep(2), 2500),     // Saudação (2.5s)
      setTimeout(() => setStep(3), 4500),     // Bem-vindo (4.5s)
      setTimeout(() => setStep(4), 6500),     // Tagline (6.5s)
      setTimeout(() => {
        setIsFadingOut(true);                 // Começa fade out (9s)
        setTimeout(onComplete, 1500);         // Completa transição (10.5s total)
      }, 9000),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 overflow-hidden transition-all duration-1000 ${
        isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 animate-float">
          <Wallet className="w-12 h-12 text-white/30" />
        </div>
        <div className="absolute top-40 right-32 animate-float-delayed">
          <TrendingUp className="w-10 h-10 text-white/30" />
        </div>
        <div className="absolute bottom-32 left-40 animate-float-slow">
          <Target className="w-14 h-14 text-white/30" />
        </div>
        <div className="absolute bottom-20 right-20 animate-float">
          <Zap className="w-8 h-8 text-white/30" />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-8">
        {/* Step 1: Logo Animation */}
        <div
          className={`transition-all duration-1000 ${
            step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-3xl shadow-2xl mb-8 animate-bounce-slow">
            <Wallet className="w-16 h-16 text-teal-600" />
          </div>
        </div>

        {/* Step 2: Greeting */}
        <div
          className={`transition-all duration-1000 ${
            step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {getGreeting()}!
          </h1>
          {userName && (
            <p className="text-2xl md:text-3xl text-white/90 font-semibold mb-8">
              {userName.split('@')[0]}
            </p>
          )}
        </div>

        {/* Step 3: Welcome Message */}
        <div
          className={`transition-all duration-1000 ${
            step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
            <p className="text-xl md:text-2xl text-white font-medium">
              Bem-vindo ao FinanceControl
            </p>
            <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
        </div>

        {/* Step 4: Tagline */}
        <div
          className={`transition-all duration-1000 ${
            step >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="inline-block bg-white/20 backdrop-blur-md rounded-2xl px-8 py-4 border-2 border-white/30">
            <p className="text-lg text-white font-semibold">
              🎯 Controle suas finanças com inteligência
            </p>
          </div>
        </div>

        {/* Loading Indicator */}
        <div
          className={`mt-12 transition-all duration-500 ${
            step >= 4 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>

      {/* Particle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
