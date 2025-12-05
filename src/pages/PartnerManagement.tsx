import React, { useEffect, useState, useMemo } from 'react';
import { db } from '@/services/db';
import { partnerService } from '@/services/partnerService';
import { Button } from '@/design/components';
import { Users, CheckCircle, Clock, UserPlus, UserMinus, Trophy, Search } from 'lucide-react';
import { feedback } from '@/utils/feedback';

/**
 * US X: Модуль напарника
 * - US X.1: Выбор напарника перед началом работы
 * - US X.2: Завершение совместной сессии с расчетом KPI
 */

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  isActive: boolean;
  lastActiveAt: number;
}

interface PartnerSession {
  id: string;
  userId: string;
  partnerId: string;
  partnerName: string;
  startedAt: number;
  endedAt?: number;
  status: 'active' | 'completed';
  stats?: {
    documentsCompleted: number;
    itemsProcessed: number;
    duration: number;
  };
}

const PartnerManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentSession, setCurrentSession] = useState<PartnerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [yesterdayPartnerId, setYesterdayPartnerId] = useState<string | null>(null);

  const currentUserId = 'current-user-id'; // В реальном приложении из AuthContext

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Загружаем только активных сотрудников (исключая текущего пользователя)
      const emps = await db.employees.toArray();
      setEmployees(emps.filter((e) => e.id !== currentUserId && e.isActive));

      // Загружаем текущую активную сессию (исключая завершенные)
      const sessions = await db.partnerSessions
        .where('userId')
        .equals(currentUserId)
        .and((s) => s.status === 'active')
        .toArray();

      if (sessions.length > 0) {
        setCurrentSession(sessions[0]);
      } else {
        // Если нет активной сессии, загружаем напарника с вчерашнего дня
        const yesterdayId = await partnerService.getYesterdayPartner(currentUserId);
        setYesterdayPartnerId(yesterdayId);
        
        // Автоматически предлагаем вчерашнего напарника
        if (yesterdayId) {
          const yesterdayPartner = emps.find(e => e.id === yesterdayId && e.isActive);
          if (yesterdayPartner) {
            setSelectedPartnerId(yesterdayId);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  // US X.1: Начать сессию с напарником
  const startSession = async () => {
    if (!selectedPartnerId) {
      feedback.error('Выберите напарника');
      return;
    }

    const partner = employees.find((e) => e.id === selectedPartnerId);
    if (!partner) return;

    const session: PartnerSession = {
      id: `session-${Date.now()}`,
      userId: currentUserId,
      partnerId: selectedPartnerId,
      partnerName: partner.name,
      startedAt: Date.now(),
      status: 'active',
    };

    try {
      await db.partnerSessions.add(session);
      setCurrentSession(session);
      feedback.success(`Сессия начата с ${partner.name}`);
    } catch (error) {
      feedback.error('Ошибка создания сессии');
    }
  };

  // US X.2: Завершить сессию с KPI
  const endSession = async () => {
    if (!currentSession) return;

    const duration = Date.now() - currentSession.startedAt;
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);

    // Подсчет статистики (в реальном приложении из БД)
    const stats = {
      documentsCompleted: 12, // Пример
      itemsProcessed: 450, // Пример
      duration,
    };

    const updatedSession: PartnerSession = {
      ...currentSession,
      status: 'completed',
      endedAt: Date.now(),
      stats,
    };

    try {
      await db.partnerSessions.update(currentSession.id, updatedSession);
      setCurrentSession(null);
      setSelectedPartnerId(null);

      // Показываем результаты
      alert(
        `Сессия завершена!\n\n` +
          `Напарник: ${currentSession.partnerName}\n` +
          `Время работы: ${hours}ч ${minutes}мин\n` +
          `Документов: ${stats.documentsCompleted}\n` +
          `Позиций обработано: ${stats.itemsProcessed}\n\n` +
          `Отличная работа!`
      );

      feedback.success('Сессия завершена');
    } catch (error) {
      feedback.error('Ошибка завершения сессии');
    }
  };

  if (loading) {
    return <div className="p-4">Загрузка...</div>;
  }

  // Активная сессия
  if (currentSession) {
    const duration = Date.now() - currentSession.startedAt;
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);

    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="card p-6 bg-success/10 border-2 border-success">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-success" size={32} />
            <div className="flex-1">
              <h2 className="text-xl font-bold">Активная сессия</h2>
              <p className="text-sm text-content-secondary">
                Работаете в паре с {currentSession.partnerName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-surface-secondary rounded-lg">
              <div className="text-xs text-content-tertiary mb-1">Время работы</div>
              <div className="text-2xl font-bold">
                {hours}ч {minutes}м
              </div>
            </div>
            <div className="p-4 bg-surface-secondary rounded-lg">
              <div className="text-xs text-content-tertiary mb-1">Начало</div>
              <div className="text-lg font-medium">
                {new Date(currentSession.startedAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full"
            onClick={endSession}
            size="lg"
          >
            <UserMinus className="mr-2" size={20} />
            Завершить сессию
          </Button>
        </div>

        {/* Реальные KPI (заглушка) */}
        <div className="card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Trophy className="text-warning" size={20} />
            Совместные достижения
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-surface-secondary rounded">
              <div className="text-2xl font-bold text-brand-primary">8</div>
              <div className="text-xs text-content-tertiary mt-1">Документов</div>
            </div>
            <div className="text-center p-3 bg-surface-secondary rounded">
              <div className="text-2xl font-bold text-success">320</div>
              <div className="text-xs text-content-tertiary mt-1">Позиций</div>
            </div>
            <div className="text-center p-3 bg-surface-secondary rounded">
              <div className="text-2xl font-bold text-warning">95%</div>
              <div className="text-xs text-content-tertiary mt-1">Точность</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter employees with search and priority for name start
  const filteredEmployees = useMemo(() => {
    if (!searchQuery) {
      return employees.sort((a, b) => a.name.localeCompare(b.name));
    }

    const query = searchQuery.toLowerCase();
    return employees
      .filter((emp) => {
        return (
          emp.name.toLowerCase().includes(query) ||
          emp.role?.toLowerCase().includes(query) ||
          emp.department?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        // Prioritize matches at the start of name
        const aStartsWith = a.name.toLowerCase().startsWith(query);
        const bStartsWith = b.name.toLowerCase().startsWith(query);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return a.name.localeCompare(b.name);
      });
  }, [employees, searchQuery]);

  // US X.1: Выбор напарника
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users size={28} />
          Выбор напарника
        </h1>
        <p className="text-content-secondary">
          Выберите сотрудника для совместной работы
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" size={20} />
        <input
          type="text"
          placeholder="Найти по имени, роли или отделу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-borders-default rounded-lg bg-surface-secondary focus:outline-none focus:border-brand-primary"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary hover:text-content-primary"
          >
            ✕
          </button>
        )}
      </div>

      {/* Yesterday's partner suggestion */}
      {yesterdayPartnerId && !searchQuery && (
        <div className="card p-4 bg-gradient-to-r from-brand-primary/5 to-brand-primary/10 border-brand-primary">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="text-brand-primary" size={20} />
            <div className="text-sm font-semibold text-brand-primary">
              💡 Вчера вы работали с этим напарником
            </div>
          </div>
          {(() => {
            const yesterdayEmployee = employees.find(e => e.id === yesterdayPartnerId);
            if (!yesterdayEmployee) return null;
            return (
              <button
                onClick={() => setSelectedPartnerId(yesterdayEmployee.id)}
                className={`w-full card p-4 text-left transition-all ${
                  selectedPartnerId === yesterdayEmployee.id
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'hover:border-brand-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        selectedPartnerId === yesterdayEmployee.id ? 'bg-brand-primary' : 'bg-surface-tertiary text-content-primary'
                      }`}
                    >
                      {yesterdayEmployee.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold">{yesterdayEmployee.name}</div>
                      <div className="text-sm text-content-secondary">
                        {yesterdayEmployee.role} • {yesterdayEmployee.department}
                      </div>
                    </div>
                  </div>
                  {selectedPartnerId === yesterdayEmployee.id && (
                    <CheckCircle className="text-brand-primary" size={24} />
                  )}
                </div>
              </button>
            );
          })()}
        </div>
      )}

      <div className="space-y-3">
        {filteredEmployees.length === 0 ? (
          <div className="card p-8 text-center">
            <Users size={48} className="mx-auto mb-4 text-content-tertiary opacity-50" />
            <p className="text-content-tertiary">
              {searchQuery ? 'Сотрудники не найдены' : 'Нет доступных сотрудников'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-brand-primary hover:underline"
              >
                Сбросить поиск
              </button>
            )}
          </div>
        ) : (
          <>
            {!searchQuery && yesterdayPartnerId && (
              <div className="text-sm text-content-tertiary px-2">
                Все доступные сотрудники ({filteredEmployees.length - 1} кроме предложенного):
              </div>
            )}
            {filteredEmployees.map((employee) => {
              // Skip yesterday's partner if already shown above
              if (employee.id === yesterdayPartnerId && !searchQuery) return null;
              
              return (
                <button
                  key={employee.id}
                  onClick={() => setSelectedPartnerId(employee.id)}
                  className={`w-full card p-4 text-left transition-all ${
                    selectedPartnerId === employee.id
                      ? 'border-brand-primary bg-brand-primary/5'
                      : 'hover:border-brand-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          selectedPartnerId === employee.id ? 'bg-brand-primary' : 'bg-surface-tertiary text-content-primary'
                        }`}
                      >
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold">{employee.name}</div>
                        <div className="text-sm text-content-secondary">
                          {employee.role} • {employee.department}
                        </div>
                      </div>
                    </div>
                    {selectedPartnerId === employee.id && (
                      <CheckCircle className="text-brand-primary" size={24} />
                    )}
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>

      {selectedPartnerId && (
        <Button onClick={startSession} className="w-full" size="lg">
          <UserPlus className="mr-2" size={20} />
          Начать совместную работу
        </Button>
      )}
    </div>
  );
};

export default PartnerManagement;
