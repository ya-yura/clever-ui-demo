// === 📁 src/components/partner/PartnerSelector.tsx ===
// Partner selection component with search and filters

import React, { useState, useEffect } from 'react';
import { Employee, PartnerFilter, PartnerStats } from '@/types/partner';
import { partnerService } from '@/services/partnerService';
import { PartnerCard } from './PartnerCard';

interface PartnerSelectorProps {
  currentUserId: string;
  onSelect: (partner: Employee) => void;
  onCancel?: () => void;
  showRecentPartners?: boolean;
}

export const PartnerSelector: React.FC<PartnerSelectorProps> = ({
  currentUserId,
  onSelect,
  onCancel,
  showRecentPartners = true,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recentPartners, setRecentPartners] = useState<PartnerStats[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Employee | null>(null);
  const [yesterdayPartnerId, setYesterdayPartnerId] = useState<string | null>(null);
  const [filter, setFilter] = useState<PartnerFilter>({ isActive: true });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'all' | 'recent'>('recent');

  // Load data
  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allEmployees, recent, yesterdayId] = await Promise.all([
        partnerService.getActiveEmployees(),
        showRecentPartners
          ? partnerService.getRecentPartners(currentUserId)
          : Promise.resolve([]),
        partnerService.getYesterdayPartner(currentUserId),
      ]);

      // Exclude current user from list
      const filtered = allEmployees.filter(emp => emp.id !== currentUserId);
      setEmployees(filtered);
      setRecentPartners(recent);
      setYesterdayPartnerId(yesterdayId);
      
      // Auto-suggest yesterday's partner if found
      if (yesterdayId) {
        const yesterdayPartner = filtered.find(emp => emp.id === yesterdayId);
        if (yesterdayPartner && yesterdayPartner.isActive) {
          setSelectedPartner(yesterdayPartner);
        }
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters with priority for name start matches
  const filteredEmployees = employees
    .filter(emp => {
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        return (
          emp.name.toLowerCase().includes(query) ||
          emp.badge?.toLowerCase().includes(query) ||
          emp.role?.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // If searching, prioritize matches at the start of name
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const aStartsWith = a.name.toLowerCase().startsWith(query);
        const bStartsWith = b.name.toLowerCase().startsWith(query);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
      }
      
      // Default alphabetical sort
      return a.name.localeCompare(b.name);
    });

  const handleSelect = (employee: Employee) => {
    if (selectedPartner?.id === employee.id) {
      setSelectedPartner(null);
    } else {
      setSelectedPartner(employee);
    }
  };

  const handleConfirm = () => {
    if (selectedPartner) {
      onSelect(selectedPartner);
    }
  };

  const getEmployeeById = (id: string): Employee | undefined => {
    return employees.find(emp => emp.id === id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Загрузка сотрудников...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Выбор напарника
          </h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Найти"
            value={filter.searchQuery || ''}
            onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
            className="w-full px-4 py-3 pl-10 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {!filter.searchQuery && (
            <span className="absolute left-3 top-3.5 text-xl pointer-events-none">🔍</span>
          )}
          {filter.searchQuery && (
            <button
              onClick={() => setFilter({ ...filter, searchQuery: '' })}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* View Toggle */}
        {showRecentPartners && recentPartners.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setView('recent')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                view === 'recent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Недавние ({recentPartners.length})
            </button>
            <button
              onClick={() => setView('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                view === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Все ({filteredEmployees.length})
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-50">
        {/* Yesterday's partner suggestion */}
        {yesterdayPartnerId && view === 'recent' && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">💡</span>
              <div className="text-sm font-semibold text-blue-900">
                Вчера вы работали с этим напарником:
              </div>
            </div>
            {(() => {
              const employee = getEmployeeById(yesterdayPartnerId);
              if (!employee || !employee.isActive) return null;
              const stats = recentPartners.find(s => s.partnerId === yesterdayPartnerId);
              return (
                <PartnerCard
                  key={employee.id}
                  employee={employee}
                  stats={stats}
                  selected={selectedPartner?.id === employee.id}
                  onClick={() => handleSelect(employee)}
                  showStats
                />
              );
            })()}
          </div>
        )}

        {view === 'recent' && recentPartners.length > 0 ? (
          <>
            <div className="text-sm text-gray-600 mb-2">
              📋 Недавние напарники:
            </div>
            {recentPartners.map(stats => {
              const employee = getEmployeeById(stats.partnerId);
              if (!employee) return null;
              // Skip yesterday's partner if already shown above
              if (yesterdayPartnerId === employee.id) return null;
              return (
                <PartnerCard
                  key={employee.id}
                  employee={employee}
                  stats={stats}
                  selected={selectedPartner?.id === employee.id}
                  onClick={() => handleSelect(employee)}
                  showStats
                />
              );
            })}
          </>
        ) : (
          <>
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-xl font-semibold text-gray-700 mb-2">
                  Сотрудники не найдены
                </div>
                <div className="text-gray-500">
                  Попробуйте изменить параметры поиска
                </div>
              </div>
            ) : (
              filteredEmployees.map(employee => (
                <PartnerCard
                  key={employee.id}
                  employee={employee}
                  selected={selectedPartner?.id === employee.id}
                  onClick={() => handleSelect(employee)}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* Footer with Action Buttons */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {selectedPartner ? (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-600 mb-1">Выбран напарник:</div>
              <div className="font-semibold text-blue-900">
                {selectedPartner.name}
              </div>
              {selectedPartner.role && (
                <div className="text-sm text-blue-700">{selectedPartner.role}</div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPartner(null)}
                className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Начать работу
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-2">
            Выберите напарника из списка
          </div>
        )}
      </div>
    </div>
  );
};

