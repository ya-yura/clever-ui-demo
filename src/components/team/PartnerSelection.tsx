// === 📁 src/components/team/PartnerSelection.tsx ===
// Enhanced partner selection with avatars and statistics

import React, { useState, useMemo } from 'react';
import { Card, Badge } from '@/design/components';
import { Search, Users, TrendingUp, TrendingDown, Clock, CheckCircle2 } from 'lucide-react';

export interface Partner {
  id: string;
  name: string;
  role: string;
  department: string;
  isOnline: boolean;
  lastActiveAt: number;
  avatar?: string;
  stats?: {
    tasksCompleted: number;
    averageTime: number; // minutes
    errorRate: number; // percentage
    trend: 'up' | 'down' | 'stable';
  };
}

interface PartnerSelectionProps {
  partners: Partner[];
  selectedPartnerId?: string;
  lastPartnerId?: string; // Yesterday's partner
  onSelect: (partnerId: string) => void;
  showStats?: boolean;
}

export const PartnerSelection: React.FC<PartnerSelectionProps> = ({
  partners,
  selectedPartnerId,
  lastPartnerId,
  onSelect,
  showStats = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter partners
  const filteredPartners = useMemo(() => {
    if (!searchQuery) return partners;

    const query = searchQuery.toLowerCase();
    return partners.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.role.toLowerCase().includes(query) ||
      p.department.toLowerCase().includes(query)
    );
  }, [partners, searchQuery]);

  // Sort: yesterday's partner first, then online, then by name
  const sortedPartners = useMemo(() => {
    return [...filteredPartners].sort((a, b) => {
      // Yesterday's partner first
      if (a.id === lastPartnerId) return -1;
      if (b.id === lastPartnerId) return 1;
      
      // Online partners next
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      
      // Alphabetical
      return a.name.localeCompare(b.name);
    });
  }, [filteredPartners, lastPartnerId]);

  /**
   * Generate initials from name
   */
  const getInitials = (name: string): string => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  /**
   * Get avatar colors based on name hash
   */
  const getAvatarColor = (name: string): string => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-orange-500 to-orange-600',
      'from-teal-500 to-teal-600',
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  /**
   * Format time since last active
   */
  const getLastActiveText = (timestamp: number): string => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    
    if (minutes < 5) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    
    const days = Math.floor(hours / 24);
    return `${days} дн назад`;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" size={20} />
        <input
          type="text"
          placeholder="Поиск напарника..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface-secondary border border-surface-tertiary rounded-lg text-content-primary placeholder-content-tertiary focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      {/* Yesterday's Partner Suggestion */}
      {lastPartnerId && !searchQuery && (
        <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-brand-primary font-medium">
            <Clock size={16} />
            <span>Вчера работали вместе</span>
          </div>
        </div>
      )}

      {/* Partners List */}
      <div className="space-y-3">
        {sortedPartners.length === 0 ? (
          <div className="text-center py-12 text-content-tertiary">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <div>Напарники не найдены</div>
          </div>
        ) : (
          sortedPartners.map((partner) => {
            const isSelected = partner.id === selectedPartnerId;
            const isLastPartner = partner.id === lastPartnerId;

            return (
              <Card
                key={partner.id}
                variant="interactive"
                onClick={() => onSelect(partner.id)}
                className={`p-4 transition-all ${
                  isLastPartner ? 'ring-2 ring-brand-primary/50' : ''
                } ${isSelected ? 'bg-brand-primary/10 border-brand-primary' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {partner.avatar ? (
                      <img
                        src={partner.avatar}
                        alt={partner.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getAvatarColor(partner.name)} flex items-center justify-center text-white font-bold text-lg`}>
                        {getInitials(partner.name)}
                      </div>
                    )}
                    
                    {/* Online indicator */}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                      partner.isOnline ? 'bg-success' : 'bg-content-tertiary'
                    }`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-content-primary truncate">
                        {partner.name}
                      </h3>
                      {isSelected && (
                        <CheckCircle2 className="text-success flex-shrink-0" size={18} />
                      )}
                      {isLastPartner && !isSelected && (
                        <Badge label="Вчера" variant="info" className="text-xs" />
                      )}
                    </div>
                    
                    <div className="text-sm text-content-secondary mb-1">
                      {partner.role} • {partner.department}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-content-tertiary">
                      <span className={partner.isOnline ? 'text-success font-medium' : ''}>
                        {partner.isOnline ? 'Онлайн' : getLastActiveText(partner.lastActiveAt)}
                      </span>
                    </div>

                    {/* Stats */}
                    {showStats && partner.stats && (
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 size={14} className="text-success" />
                          <span className="text-content-secondary">
                            {partner.stats.tasksCompleted} задач
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-brand-primary" />
                          <span className="text-content-secondary">
                            ~{partner.stats.averageTime} мин
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {partner.stats.trend === 'up' ? (
                            <TrendingUp size={14} className="text-success" />
                          ) : partner.stats.trend === 'down' ? (
                            <TrendingDown size={14} className="text-error" />
                          ) : null}
                          <span className={`${
                            partner.stats.trend === 'up' ? 'text-success' :
                            partner.stats.trend === 'down' ? 'text-error' :
                            'text-content-tertiary'
                          }`}>
                            {partner.stats.errorRate}% ошибок
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};


