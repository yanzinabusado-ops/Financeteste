import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function UserProfileMenu() {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const displayName = user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
          <User className="w-5 h-5 text-white" />
        </div>
        
        {/* Name */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-bold text-gray-800">{displayName}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-slideDown">
            <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{displayName}</p>
                  <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-left text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-semibold">Sair</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
