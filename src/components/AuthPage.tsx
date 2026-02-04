import { useState } from 'react';
import Login from './Login';
import Register from './Register';
import { Wallet } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              FinanceControl
            </h1>
          </div>

          <p className="text-xl lg:text-2xl text-gray-700 mb-4">
            Controle suas finanças de forma simples e eficiente
          </p>

          <p className="text-gray-600 mb-8">
            Gerencie suas receitas e despesas, visualize relatórios e tome decisões financeiras mais inteligentes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-emerald-100">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold text-gray-800 mb-1">Controle Total</h3>
              <p className="text-sm text-gray-600">Gerencie todas suas receitas e despesas</p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-emerald-100">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-800 mb-1">Relatórios</h3>
              <p className="text-sm text-gray-600">Visualize seus gastos por categoria</p>
            </div>

            <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-emerald-100">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-gray-800 mb-1">Seguro</h3>
              <p className="text-sm text-gray-600">Seus dados protegidos e privados</p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full flex justify-center">
          {isLogin ? (
            <Login onToggleMode={() => setIsLogin(false)} />
          ) : (
            <Register onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
}
