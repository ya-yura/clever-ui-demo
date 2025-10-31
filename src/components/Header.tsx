// === 📁 src/components/Header.tsx ===
// Header component with navigation and sync status

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useMenu } from '@/modules/menu';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOnline } = useOfflineStorage('app');
  const { openMenu } = useMenu();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isHome = location.pathname === '/';

  const handleLogout = () => {
    if (confirm('Выйти из системы?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <header className="bg-[#343436] text-[#e3e3dd] shadow-lg sticky top-0 z-50 border-b border-[#474747]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[#474747] rounded-lg transition-colors"
                aria-label="Назад"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            {isHome && (
              <button
                onClick={openMenu}
                className="p-2 hover:bg-[#474747] rounded-lg transition-colors touch-manipulation"
                aria-label="Открыть меню"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <h1 
              className="text-2xl font-normal cursor-pointer tracking-wide"
              onClick={() => navigate('/')}
            >
              Склад 15
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Online/Offline status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-sm hidden sm:inline">{isOnline ? 'Онлайн' : 'Оффлайн'}</span>
            </div>

            {/* User menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 hover:bg-[#474747] rounded-lg transition-colors"
                  aria-label="Меню пользователя"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <span className="text-sm hidden md:inline">{user.name}</span>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-[#474747] rounded-lg shadow-lg border border-[#555] z-50">
                      <div className="p-4 border-b border-[#555]">
                        <p className="text-sm text-[#e3e3dd] font-medium">{user.name}</p>
                        <p className="text-xs text-[#a7a7a7]">@{user.username}</p>
                        {user.role && (
                          <p className="text-xs text-[#a7a7a7] mt-1">Роль: {user.role}</p>
                        )}
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/settings');
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-[#e3e3dd] hover:bg-[#525252] rounded transition-colors"
                        >
                          ⚙️ Настройки
                        </button>
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#525252] rounded transition-colors"
                        >
                          🚪 Выйти
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

