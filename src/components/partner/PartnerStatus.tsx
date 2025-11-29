// === 📁 src/components/partner/PartnerStatus.tsx ===
// Current partner session status component

import React from 'react';
import { PartnerSession, Employee, WORK_TYPE_LABELS, WORK_TYPE_ICONS } from '@/types/partner';
import { partnerService } from '@/services/partnerService';

interface PartnerStatusProps {
  session: PartnerSession;
  partner: Employee;
  onPause?: () => void;
  onResume?: () => void;
  onEnd?: () => void;
}

export const PartnerStatus: React.FC<PartnerStatusProps> = ({
  session,
  partner,
  onPause,
  onResume,
  onEnd,
}) => {
  const duration = partnerService.formatSessionDuration(session);
  const isActive = session.status === 'active';
  const isPaused = session.status === 'paused';

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤝</span>
          <div>
            <div className="text-xs opacity-80">Работаете с напарником</div>
            <div className="font-semibold text-lg">{partner.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-80">Время</div>
          <div className="font-semibold">{duration}</div>
        </div>
      </div>

      {/* Work Type */}
      {session.workType && (
        <div className="flex items-center gap-2 mb-3 bg-white bg-opacity-20 rounded px-3 py-2">
          <span className="text-xl">{WORK_TYPE_ICONS[session.workType]}</span>
          <span className="text-sm">{WORK_TYPE_LABELS[session.workType]}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white bg-opacity-20 rounded px-2 py-1.5 text-center">
          <div className="text-xs opacity-80">Документов</div>
          <div className="font-semibold">{session.documentsCompleted}</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded px-2 py-1.5 text-center">
          <div className="text-xs opacity-80">Строк</div>
          <div className="font-semibold">{session.linesProcessed}</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded px-2 py-1.5 text-center">
          <div className="text-xs opacity-80">Товаров</div>
          <div className="font-semibold">{session.itemsProcessed}</div>
        </div>
      </div>

      {/* Status */}
      {isPaused && (
        <div className="bg-yellow-400 bg-opacity-90 text-yellow-900 rounded px-3 py-2 mb-3 text-sm font-medium text-center">
          ⏸️ На паузе
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isActive && onPause && (
          <button
            onClick={onPause}
            className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded py-2 px-4 font-medium transition-all"
          >
            ⏸️ Пауза
          </button>
        )}
        {isPaused && onResume && (
          <button
            onClick={onResume}
            className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded py-2 px-4 font-medium transition-all"
          >
            ▶️ Продолжить
          </button>
        )}
        {onEnd && (
          <button
            onClick={onEnd}
            className="flex-1 bg-white hover:bg-opacity-90 hover:text-blue-600 rounded py-2 px-4 font-medium transition-all"
          >
            ✓ Завершить
          </button>
        )}
      </div>
    </div>
  );
};

