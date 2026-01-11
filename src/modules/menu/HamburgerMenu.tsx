// === 📁 src/modules/menu/HamburgerMenu.tsx ===
// Main hamburger menu component with swipe support and animations

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, User } from 'lucide-react';
import { useMenu } from './useMenu';
import MenuOverlay from './MenuOverlay';
import MenuItem from './MenuItem';
import { menuItems, appMetadata } from './MenuData';
import { db } from '@/services/db';

interface HamburgerMenuProps {
  onSync?: () => void;
  onUpdateReferences?: () => void;
  onLogout?: () => void;
  onInstallInterface?: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  onSync,
  onUpdateReferences,
  onLogout,
  onInstallInterface,
}) => {
  const { isOpen, closeMenu } = useMenu();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userName, setUserName] = useState<string>('Пользователь');
  const [showModal, setShowModal] = useState<string | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load user data from IndexedDB
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Try to get user from employees table
        const employees = await db.employees.toArray();
        if (employees.length > 0) {
          setUserName(employees[0].name || 'Пользователь');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isOpen) {
        closeMenu();
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50,
  });

  // Handle menu item actions
  const handleAction = (action: string, value?: string) => {
    switch (action) {
      case 'navigate':
        if (value) {
          navigate(value);
          closeMenu();
        }
        break;

      case 'function':
        if (value === 'triggerSync' && onSync) {
          onSync();
          closeMenu();
          showToast('Синхронизация запущена');
        } else if (value === 'updateReferences' && onUpdateReferences) {
          onUpdateReferences();
          closeMenu();
          showToast('Обновление справочников');
        } else if (value === 'installInterface' && onInstallInterface) {
          onInstallInterface();
          closeMenu();
        } else if (value === 'sendFeedback') {
          closeMenu();
          showToast('Отзыв отправлен в локальный лог');
        } else if (value === 'logout' && onLogout) {
          onLogout();
          closeMenu();
        }
        break;

      case 'modal':
        setShowModal(value || null);
        // Don't close menu, just show modal
        break;

      default:
        break;
    }
  };

  // Simple toast notification
  const showToast = (message: string) => {
    // You can implement a proper toast system later
    console.log('Toast:', message);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && <MenuOverlay isOpen={isOpen} onClose={closeMenu} />}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...swipeHandlers}
            className="fixed top-0 left-0 h-full w-[85vw] max-w-[400px] bg-surface-overlay backdrop-blur-md shadow-2xl z-50 flex flex-col border-r border-border-default"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeInOut' }}
          >
            {/* Header with status */}
            <div className="flex-shrink-0 px-4 py-6 border-b border-border-default bg-gradient-to-b from-surface-secondary/50 to-transparent">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-content-inverse" />
                  </div>
                  <div>
                    <p className="text-content-primary font-semibold text-base">{userName}</p>
                    <p className="text-content-secondary text-sm">{appMetadata.name}</p>
                  </div>
                </div>
              </div>

              {/* Online/Offline indicator */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-success" />
                    <span className="text-sm text-success font-medium">Онлайн</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-error" />
                    <span className="text-sm text-error font-medium">Оффлайн</span>
                  </>
                )}
              </div>
            </div>

            {/* Menu items - scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <nav className="py-2">
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    isOnline={isOnline}
                    onAction={handleAction}
                  />
                ))}
              </nav>
            </div>

            {/* Footer with app info */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-border-default bg-surface-secondary/30">
              <div className="text-center">
                <p className="text-content-secondary text-xs">
                  {appMetadata.vendor} · Версия {appMetadata.version}
                </p>
                <p className="text-content-tertiary text-xs mt-1">
                  Сборка {appMetadata.build}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal placeholder - can be extended later */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-surface-overlay" 
            onClick={() => setShowModal(null)}
          />
          <div className="relative bg-surface-secondary rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border-default">
            <h2 className="text-xl font-bold text-content-primary mb-4">
              {showModal}
            </h2>
            <p className="text-content-secondary mb-6">
              Модальное окно для: {showModal}
            </p>
            <button
              className="w-full py-3 bg-brand-primary hover:bg-brand-primary/90 text-content-inverse rounded-lg font-medium transition-colors"
              onClick={() => setShowModal(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HamburgerMenu;

