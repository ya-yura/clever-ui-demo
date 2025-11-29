// === 📁 src/pages/PartnerManagement.tsx ===
// Partner management page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee, PartnerSession, WorkType } from '@/types/partner';
import { partnerService } from '@/services/partnerService';
import { PartnerSelector } from '@/components/partner/PartnerSelector';
import { PartnerStatus } from '@/components/partner/PartnerStatus';

// Mock current user ID (in real app, get from auth context)
const CURRENT_USER_ID = 'user-001';

const PartnerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState<PartnerSession | null>(null);
  const [partner, setPartner] = useState<Employee | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentSession();
  }, []);

  const loadCurrentSession = async () => {
    setLoading(true);
    try {
      const session = await partnerService.getCurrentSession(CURRENT_USER_ID);
      if (session) {
        setCurrentSession(session);
        const partnerData = await partnerService.getEmployee(session.partnerId);
        setPartner(partnerData || null);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (selectedPartner: Employee) => {
    try {
      const session = await partnerService.startSession(
        CURRENT_USER_ID,
        selectedPartner.id
      );
      setCurrentSession(session);
      setPartner(selectedPartner);
      setShowSelector(false);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Ошибка при создании сессии');
    }
  };

  const handlePauseSession = async () => {
    if (!currentSession) return;
    try {
      await partnerService.pauseSession(currentSession.id);
      await loadCurrentSession();
    } catch (error) {
      console.error('Error pausing session:', error);
      alert('Ошибка при постановке на паузу');
    }
  };

  const handleResumeSession = async () => {
    if (!currentSession) return;
    try {
      await partnerService.resumeSession(currentSession.id);
      await loadCurrentSession();
    } catch (error) {
      console.error('Error resuming session:', error);
      alert('Ошибка при возобновлении сессии');
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;
    
    const confirm = window.confirm(
      `Завершить работу с напарником ${partner?.name}?\n\nСтатистика будет сохранена.`
    );
    
    if (!confirm) return;

    try {
      await partnerService.endSession(currentSession.id);
      setCurrentSession(null);
      setPartner(null);
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Ошибка при завершении сессии');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  // Show selector if no active session
  if (showSelector || (!currentSession && !loading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <PartnerSelector
          currentUserId={CURRENT_USER_ID}
          onSelect={handleStartSession}
          onCancel={() => {
            setShowSelector(false);
            navigate('/');
          }}
        />
      </div>
    );
  }

  // Show current session
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            ← Назад
          </button>
          <h1 className="text-xl font-bold text-gray-900">Совместная работа</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {/* Current Session */}
        {currentSession && partner && (
          <PartnerStatus
            session={currentSession}
            partner={partner}
            onPause={handlePauseSession}
            onResume={handleResumeSession}
            onEnd={handleEndSession}
          />
        )}

        {/* Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            💡 Совместная работа
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Работайте вместе над документами</li>
            <li>• Статистика сохраняется автоматически</li>
            <li>• Используйте паузу для перерывов</li>
            <li>• Завершите сессию по окончании работы</li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-gray-900 mb-3">Быстрые действия</h3>
          
          <button
            onClick={() => navigate('/documents')}
            className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <div className="font-semibold text-gray-900">Все документы</div>
                <div className="text-sm text-gray-600">
                  Выберите документ для работы
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/receiving')}
            className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📦</span>
              <div>
                <div className="font-semibold text-gray-900">Приёмка</div>
                <div className="text-sm text-gray-600">
                  Принимайте товар вместе
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/picking')}
            className="w-full bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🛒</span>
              <div>
                <div className="font-semibold text-gray-900">Подбор</div>
                <div className="text-sm text-gray-600">
                  Подбирайте заказы совместно
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerManagement;

