import { useEffect, useMemo, useState } from 'react';
import {
  calculateAdoptionStats,
  calculateQualityStats,
  calculateSatisfactionStats,
  calculateSyncStats,
  calculateThroughputStats,
  calculateTimeStats,
  DashboardFilters,
  defaultFilters,
  filterRecords,
} from '@/utils/statCalculations';
import { DocumentType, DOCUMENT_TYPE_LABELS } from '@/types/document';
import { ShiftName } from '@/data/mockStats';

const timeWindowOptions = [
  { label: '7 дней', value: 7 },
  { label: '30 дней', value: 30 },
  { label: '90 дней', value: 90 },
];

const shifts: Array<{ label: string; value: ShiftName | 'all' }> = [
  { label: 'Все смены', value: 'all' },
  { label: 'Утро', value: 'morning' },
  { label: 'День', value: 'day' },
  { label: 'Вечер', value: 'evening' },
  { label: 'Ночь', value: 'night' },
];

const docTypeOptions: Array<{ label: string; value: DocumentType | 'all' }> = [
  { label: 'Все операции', value: 'all' },
  ...Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => ({
    label,
    value: value as DocumentType,
  })),
];

const formatMinutes = (value: number) => `${value.toFixed(1)} мин`;
const formatSeconds = (value: number) => `${value.toFixed(0)} сек`;
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const downloadBlob = (data: string, filename: string, type = 'text/csv') => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const toCsv = (filters: DashboardFilters) => {
  const rows = filterRecords(filters).map((record) => ({
    id: record.id,
    docType: DOCUMENT_TYPE_LABELS[record.docType],
    operator: record.operatorName,
    shift: record.shift,
    startTime: record.startTime,
    endTime: record.endTime,
    durationMinutes: ((new Date(record.endTime).getTime() - new Date(record.startTime).getTime()) / 60000).toFixed(2),
    itemsProcessed: record.itemsProcessed,
    errors: record.errors,
    discrepancies: record.discrepancies,
    wizardFlow: record.featureUsage.wizardFlow ? 'yes' : 'no',
    autoComplete: record.featureUsage.autoComplete ? 'yes' : 'no',
    offlineSeconds: record.offlineSeconds,
    syncSuccessRate: record.sync.attempts
      ? ((record.sync.successes / record.sync.attempts) * 100).toFixed(1)
      : '0.0',
  }));

  const header = Object.keys(rows[0] ?? {}).join(',');
  const body = rows.map((row) => Object.values(row).join(',')).join('\n');
  return `${header}\n${body}`;
};

const toJson = (data: Record<string, unknown>) => JSON.stringify(data, null, 2);

const STAT_ACCESS_KEY = 'KnM-bei-4Px-Q59';
const STAT_ACCESS_STORAGE_KEY = 'stat_access_granted';

const StatDashboard = () => {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [hasAccess, setHasAccess] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const allowed =
      typeof window !== 'undefined' && sessionStorage.getItem(STAT_ACCESS_STORAGE_KEY) === 'true';
    setHasAccess(allowed);
  }, []);

  const handleUnlock = (event: React.FormEvent) => {
    event.preventDefault();
    if (keyInput.trim() === STAT_ACCESS_KEY) {
      setHasAccess(true);
      sessionStorage.setItem(STAT_ACCESS_STORAGE_KEY, 'true');
      setError(null);
    } else {
      setError('Неверный ключ доступа');
    }
  };

  const filteredRecords = useMemo(() => filterRecords(filters), [filters]);
  const timeStats = useMemo(() => calculateTimeStats(filteredRecords), [filteredRecords]);
  const qualityStats = useMemo(() => calculateQualityStats(filteredRecords), [filteredRecords]);
  const throughputStats = useMemo(() => calculateThroughputStats(filteredRecords), [filteredRecords]);
  const adoptionStats = useMemo(() => calculateAdoptionStats(filteredRecords), [filteredRecords]);
  const syncStats = useMemo(() => calculateSyncStats(filteredRecords), [filteredRecords]);
  const satisfactionStats = useMemo(() => calculateSatisfactionStats(filteredRecords), [filteredRecords]);

  const handleDownloadCsv = () => {
    const csv = toCsv(filters);
    downloadBlob(csv, 'warehouse-telemetry.csv');
  };

  const handleDownloadJson = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      sampleSize: filteredRecords.length,
      filters,
      timeStats,
      qualityStats,
      throughputStats,
      adoptionStats,
      syncStats,
      satisfactionStats,
    };
    downloadBlob(toJson(payload), 'warehouse-kpi.json', 'application/json');
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-surface-primary text-content-primary flex items-center justify-center p-6">
        <div className="bg-surface-secondary border border-borders-default rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
          <div>
            <p className="text-sm uppercase tracking-widest text-content-tertiary">Доступ ограничен</p>
            <h1 className="text-2xl font-bold mt-1">Статистический дашборд</h1>
            <p className="text-content-secondary mt-2">
              Чтобы открыть раздел, введите выданный ключ. Данные остаются скрытыми для пользователей
              приложения.
            </p>
          </div>
          <form className="space-y-3" onSubmit={handleUnlock}>
            <label className="text-sm text-content-tertiary block">Ключ доступа</label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-transparent border border-borders-default rounded-md px-3 py-2 focus:border-brand-primary outline-none font-mono"
              placeholder="••••-•••-•••-•••"
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <button
              type="submit"
              className="w-full bg-brand-primary text-white rounded-md py-2 font-semibold hover:bg-brand-primary/90 transition"
            >
              Разблокировать
            </button>
          </form>
          <p className="text-xs text-content-tertiary">
            Запросить доступ можно у администратора проекта Cleverence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary p-6 space-y-6">
      <header className="flex flex-wrap gap-4 items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-content-tertiary">Статистика</p>
          <h1 className="text-3xl font-bold mt-1">Операционный дашборд</h1>
          <p className="text-content-secondary mt-1 max-w-2xl">
            Сводные KPI для контроля эффективности, качества, пропускной способности, устойчивости и пользовательского
            опыта. Используются данные телеметрии: события документов, сканов, синхронизаций и фидбеков.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 rounded-md border border-borders-default hover:bg-surface-secondary transition"
          >
            Скачать CSV
          </button>
          <button
            onClick={handleDownloadJson}
            className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 transition"
          >
            Экспорт JSON
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="bg-surface-secondary rounded-xl border border-borders-default p-4 space-y-2">
          <p className="text-sm text-content-tertiary">Тип операции</p>
          <select
            value={filters.docType}
            onChange={(e) => setFilters((prev) => ({ ...prev, docType: e.target.value as DocumentType | 'all' }))}
            className="w-full bg-transparent border border-borders-default rounded-md px-3 py-2 focus:border-brand-primary outline-none"
          >
            {docTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-surface-secondary rounded-xl border border-borders-default p-4 space-y-2">
          <p className="text-sm text-content-tertiary">Смена</p>
          <select
            value={filters.shift}
            onChange={(e) => setFilters((prev) => ({ ...prev, shift: e.target.value as ShiftName | 'all' }))}
            className="w-full bg-transparent border border-borders-default rounded-md px-3 py-2 focus:border-brand-primary outline-none"
          >
            {shifts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-surface-secondary rounded-xl border border-borders-default p-4 space-y-2">
          <p className="text-sm text-content-tertiary">Окно анализа</p>
          <select
            value={filters.days}
            onChange={(e) => setFilters((prev) => ({ ...prev, days: Number(e.target.value) }))}
            className="w-full bg-transparent border border-borders-default rounded-md px-3 py-2 focus:border-brand-primary outline-none"
          >
            {timeWindowOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <SummaryCard title="Медиана времени на документ" value={formatMinutes(timeStats.median)} subtitle="P50" />
        <SummaryCard title="P90 времени" value={formatMinutes(timeStats.p90)} subtitle="Долгие кейсы" />
        <SummaryCard
          title="Документов/час"
          value={timeStats.median ? throughputStats.docsPerHour.toFixed(1) : '0.0'}
          subtitle="Средний темп"
        />
        <SummaryCard
          title="Ошибок на 100 позиций"
          value={(qualityStats.errorRate).toFixed(2)}
          subtitle="Error Rate"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-surface-secondary rounded-2xl border border-borders-default p-6 space-y-4">
          <SectionHeader title="Время операций" description="Средние значения по выбранному набору документов." />
          <div className="grid gap-3">
            <MetricRow label="Среднее время на документ" value={formatMinutes(timeStats.mean)} />
            <MetricRow label="Время на позицию" value={`${timeStats.perItem.toFixed(2)} мин/позиция`} />
            <MetricRow label="Средний интервал между сканами" value={formatSeconds(timeStats.perScan)} />
          </div>
          <div className="border-t border-borders-default pt-4">
            <p className="text-sm font-medium mb-2">По типам документов</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(timeStats.perType).map(([docType, value]) => (
                <div key={docType} className="flex justify-between text-sm text-content-secondary">
                  <span>{DOCUMENT_TYPE_LABELS[docType as DocumentType]}</span>
                  <span className="text-content-primary font-semibold">{value.toFixed(1)} мин</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface-secondary rounded-2xl border border-borders-default p-6 space-y-4">
          <SectionHeader title="Качество и ошибки" description="Расчёт на основе событий discrepancies/errors." />
          <div className="grid gap-3">
            <MetricRow label="Error Rate" value={formatPercent(qualityStats.errorRate)} />
            <MetricRow label="Discrepancy Rate" value={formatPercent(qualityStats.discrepancyRate)} />
            <MetricRow label="Rework Rate" value={formatPercent(qualityStats.reworkRate)} />
            <MetricRow label="False Positive Scans" value={formatPercent(qualityStats.falsePositiveRate)} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-surface-secondary rounded-2xl border border-borders-default p-6 space-y-4">
          <SectionHeader
            title="Производительность"
            description="Документы и позиции в час, а также лучшие операторы за выбранный период."
          />
          <div className="grid gap-3">
            <MetricRow label="Документов/час" value={throughputStats.docsPerHour.toFixed(2)} />
            <MetricRow label="Позиции/час" value={throughputStats.itemsPerHour.toFixed(0)} />
          </div>
          <div className="border-t border-borders-default pt-4 space-y-2">
            <p className="text-sm font-medium">Лидеры по скоростям</p>
            {throughputStats.bestOperators.map((entry) => (
              <div key={entry.operator} className="flex items-center justify-between text-sm">
                <span>{entry.operator}</span>
                <span className="text-content-secondary">{entry.itemsPerHour.toFixed(0)} поз/час</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-secondary rounded-2xl border border-borders-default p-6 space-y-4">
          <SectionHeader
            title="Принятие фич"
            description="Доля документов, в которых задействовали конкретные сценарии."
          />
          <div className="grid gap-4">
            <ProgressLine label="Сценарный UX" value={adoptionStats.wizard} />
            <ProgressLine label="Auto-complete" value={adoptionStats.autoComplete} />
            <ProgressLine label="Голосовые подсказки" value={adoptionStats.voice} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-surface-secondary rounded-2xl border border-borders-default p-6 space-y-4">
          <SectionHeader
            title="Надёжность и оффлайн"
            description="Показатели синхронизаций и времени вне сети."
          />
          <div className="grid gap-3">
            <MetricRow label="Успешных синков" value={formatPercent(syncStats.successRate)} />
            <MetricRow label="Средняя задержка синка" value={formatSeconds(syncStats.avgDelay)} />
            <MetricRow label="Доля оффлайн времени" value={formatPercent(syncStats.offlineShare)} />
          </div>
        </div>

        <div className="bg-surface-secondary rounded-2xl border border-borders-default p-6 space-y-4">
          <SectionHeader title="UX и бизнес" description="CSAT/NPS по собранным отзывам и опросам." />
          <div className="grid gap-3">
            <MetricRow label="Средний CSAT" value={satisfactionStats.csatAvg.toFixed(1)} />
            <MetricRow label="NPS (операторы/менеджеры)" value={`${satisfactionStats.nps.toFixed(1)}`} />
          </div>
        </div>
      </section>

      <section className="bg-surface-secondary rounded-2xl border border-borders-default p-6 space-y-4">
        <SectionHeader
          title="Сырые события"
          description="В базе хранится 100% закрытий документов и критических ошибок. При необходимости можно расширить диапазон фильтра."
        />
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-content-tertiary border-b border-borders-default">
                <th className="py-2 pr-4 font-normal">Документ</th>
                <th className="py-2 pr-4 font-normal">Тип</th>
                <th className="py-2 pr-4 font-normal">Оператор</th>
                <th className="py-2 pr-4 font-normal">Время</th>
                <th className="py-2 pr-4 font-normal">Позиции</th>
                <th className="py-2 pr-4 font-normal">Ошибки</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.slice(0, 8).map((record) => (
                <tr key={record.id} className="border-b border-borders-default/60">
                  <td className="py-2 pr-4 font-mono text-xs">{record.id}</td>
                  <td className="py-2 pr-4">{DOCUMENT_TYPE_LABELS[record.docType]}</td>
                  <td className="py-2 pr-4">{record.operatorName}</td>
                  <td className="py-2 pr-4 text-content-secondary">
                    {new Date(record.startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} –{' '}
                    {new Date(record.endTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2 pr-4">{record.itemsProcessed}</td>
                  <td className="py-2 pr-4 text-error">{record.errors || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const SummaryCard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
  <div className="bg-surface-secondary rounded-2xl border border-borders-default p-4 space-y-2">
    <p className="text-sm text-content-tertiary">{title}</p>
    <p className="text-2xl font-semibold">{value}</p>
    {subtitle && <p className="text-xs text-content-tertiary uppercase tracking-widest">{subtitle}</p>}
  </div>
);

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div>
    <h2 className="text-xl font-semibold">{title}</h2>
    <p className="text-sm text-content-secondary">{description}</p>
  </div>
);

const MetricRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-content-secondary">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const ProgressLine = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span>{label}</span>
      <span className="text-content-secondary">{value.toFixed(0)}%</span>
    </div>
    <div className="h-2 bg-surface-primary rounded-full overflow-hidden">
      <div
        className="h-full bg-brand-secondary transition-all"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  </div>
);

export default StatDashboard;


