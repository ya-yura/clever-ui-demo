// === 📁 src/components/WorkspaceWidget.tsx ===
// Workspace widget showing current work, progress, and tasks

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/db';
import { UserPreferencesService } from '@/utils/userPreferences';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  FileText, 
  ArrowRight,
  Target
} from 'lucide-react';

interface WorkDocument {
  id: string;
  type: string;
  status: string;
  progress: number;
  lastAccessedAt: number;
  completedLines: number;
  totalLines: number;
}

export const WorkspaceWidget: React.FC = () => {
  const [currentDocuments, setCurrentDocuments] = useState<WorkDocument[]>([]);
  const [avgProgress, setAvgProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    setLoading(true);
    try {
      // Get recent documents from preferences
      const recentDocs = UserPreferencesService.getRecentDocuments(10);
      
      // Load document details
      const workDocs: WorkDocument[] = [];
      let totalProgress = 0;

      for (const recent of recentDocs.slice(0, 3)) {
        try {
          const doc = await db.universalDocuments.get(recent.documentId);
          if (doc && doc.status !== 'completed') {
            const progress = doc.totalLines > 0 
              ? Math.round((doc.completedLines / doc.totalLines) * 100)
              : 0;

            workDocs.push({
              id: doc.id,
              type: doc.type || 'Документ',
              status: doc.status || 'new',
              progress,
              lastAccessedAt: recent.lastAccessedAt,
              completedLines: doc.completedLines || 0,
              totalLines: doc.totalLines || 0,
            });

            totalProgress += progress;
          }
        } catch (error) {
          console.error('Failed to load document:', error);
        }
      }

      setCurrentDocuments(workDocs);
      setAvgProgress(workDocs.length > 0 ? Math.round(totalProgress / workDocs.length) : 0);
    } catch (error) {
      console.error('Failed to load workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return 'text-warning bg-warning/10';
      case 'completed':
        return 'text-success bg-success/10';
      case 'new':
      case 'pending':
        return 'text-brand-primary bg-brand-primary/10';
      default:
        return 'text-content-secondary bg-surface-tertiary';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      in_progress: 'В работе',
      completed: 'Завершён',
      new: 'Новый',
      pending: 'Ожидает',
    };
    return labels[status.toLowerCase()] || status;
  };

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Priemka: 'Приёмка',
      Razmeschenie: 'Размещение',
      Picking: 'Подбор',
      Otgruzka: 'Отгрузка',
      Inventarizaciya: 'Инвентаризация',
      Vozvrat: 'Возврат',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="bg-surface-secondary rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-surface-tertiary rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-surface-tertiary rounded"></div>
          <div className="h-20 bg-surface-tertiary rounded"></div>
        </div>
      </div>
    );
  }

  if (currentDocuments.length === 0) {
    return (
      <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-2xl p-6 border-2 border-brand-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-brand-primary/20 rounded-xl">
            <Target size={28} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Моё рабочее место</h2>
            <p className="text-sm text-content-secondary">Начните работать с документами</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/docs')}
          className="w-full p-4 bg-white hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between font-medium"
        >
          <span>Выбрать документ</span>
          <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-2xl p-6 border border-brand-primary/20 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/20 rounded-lg">
            <TrendingUp size={24} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Моё рабочее место</h2>
            <p className="text-sm text-content-secondary">
              {currentDocuments.length} {currentDocuments.length === 1 ? 'документ' : 'документа'} в работе
            </p>
          </div>
        </div>
        
        {/* Average Progress */}
        <div className="text-right">
          <div className="text-3xl font-bold text-brand-primary">{avgProgress}%</div>
          <div className="text-xs text-content-tertiary">Средний прогресс</div>
        </div>
      </div>

      {/* Current Documents */}
      <div className="space-y-3 mb-4">
        {currentDocuments.map((doc) => (
          <button
            key={doc.id}
            onClick={() => navigate(`/docs/${doc.type}/${doc.id}`)}
            className="w-full bg-white rounded-xl p-4 hover:shadow-md transition-all border-2 border-transparent hover:border-brand-primary/30 text-left"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">{doc.id}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-content-tertiary">
                    {getDocTypeLabel(doc.type)}
                  </span>
                  <span className="text-xs">•</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(doc.status)}`}>
                    {getStatusLabel(doc.status)}
                  </span>
                </div>
              </div>
              <ArrowRight size={18} className="text-content-tertiary flex-shrink-0 mt-1" />
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-content-secondary">
                <span>{doc.completedLines} / {doc.totalLines} строк</span>
                <span className="font-bold text-brand-primary">{doc.progress}%</span>
              </div>
              <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-500"
                  style={{ width: `${doc.progress}%` }}
                />
              </div>
            </div>

            {/* Last accessed */}
            <div className="flex items-center gap-1 mt-2 text-xs text-content-tertiary">
              <Clock size={12} />
              <span>
                {new Date(doc.lastAccessedAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-separator flex gap-2">
        <button
          onClick={() => navigate('/docs')}
          className="flex-1 py-2 px-3 bg-surface-secondary hover:bg-surface-tertiary rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <FileText size={16} />
          Все документы
        </button>
        <button
          onClick={loadWorkspace}
          className="py-2 px-3 bg-surface-secondary hover:bg-surface-tertiary rounded-lg text-sm font-medium transition-colors"
        >
          ↻
        </button>
      </div>
    </div>
  );
};






