// === 📁 src/pages/DocumentsByType.tsx ===
// Documents list for a specific document type

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { odataCache } from '@/services/odataCache';
import { ODataDocument, ODataDocumentType } from '@/types/odata';
import { useDocumentHeader } from '@/contexts/DocumentHeaderContext';

// Short, human-friendly titles per document type
const SHORT_TITLES: Record<string, string> = {
  PrihodNaSklad: 'Приход',
  RazmeshhenieVYachejki: 'Размещение',
  PodborZakaza: 'Подбор',
  Otgruzka: 'Отгрузка',
  Inventarizaciya: 'Инвентаризация',
  Vozvrat: 'Возврат',
};

const toShortTitle = (raw: string): string => {
  if (!raw) return '';
  const spaced = raw
    .replace(/([A-Z])([a-z]+)/g, ' $1$2')
    .replace(/([А-ЯЁ])([а-яё]+)/g, ' $1$2')
    .trim();
  const first = spaced.split(/\s+/)[0];
  return first ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : raw;
};

const DocumentsByType: React.FC = () => {
  const { docTypeUni } = useParams<{ docTypeUni: string }>();
  const navigate = useNavigate();
  const { setListInfo } = useDocumentHeader();
  
  const [documents, setDocuments] = useState<ODataDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docTypeName, setDocTypeName] = useState<string>('');
  const [allDocTypes, setAllDocTypes] = useState<ODataDocumentType[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_process' | 'finished'>('all');

  useEffect(() => {
    if (docTypeUni) {
      loadDocuments();
    }
  }, [docTypeUni]);

  // Load all doc types for quick switching chips
  useEffect(() => {
    (async () => {
      try {
        const types = await odataCache.getDocTypes();
        setAllDocTypes(types);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Calculate filtered documents by status
  const filteredDocuments = useMemo(() => {
    if (statusFilter === 'all') return documents;
    if (statusFilter === 'finished') return documents.filter((d: any) => d.finished === true);
    if (statusFilter === 'in_process') return documents.filter((d: any) => d.inProcess === true);
    // 'new'
    return documents.filter((d: any) => !d.finished && !d.inProcess);
  }, [documents, statusFilter]);

  // Update header with list info (short title)
  useEffect(() => {
    if (docTypeName) {
      setListInfo({
        title: docTypeName,
        count: filteredDocuments.length,
      });
    }
    
    return () => {
      setListInfo(null);
    };
  }, [docTypeName, filteredDocuments.length, setListInfo]);

  const loadDocuments = async () => {
    if (!docTypeUni) return;

    console.log(`📄 [DOCS] Loading documents for type: ${docTypeUni}`);

    try {
      setLoading(true);
      setError(null);

      // Try to resolve short title
      let displayName = SHORT_TITLES[docTypeUni] || toShortTitle(docTypeUni);
      
      try {
        const docTypes = await odataCache.getDocTypes();
        const docType = docTypes.find(dt => dt.uni === docTypeUni);
        if (docType) {
          const source = docType.displayName || docType.name || docType.uni;
          displayName = SHORT_TITLES[docType.uni] || toShortTitle(String(source));
        }
        console.log(`📄 [DOCS] Display name: ${displayName}`);
      } catch (err) {
        console.warn('⚠️ [DOCS] Could not load doc type info:', err);
      }

      setDocTypeName(displayName);

      // Fetch documents from cache/API and filter client-side using multiple names
      console.log(`📄 [DOCS] Fetching documents for: ${docTypeUni}`);
      let names: string[] | undefined;
      try {
        const types = await odataCache.getDocTypes();
        const t = types.find(dt => dt.uni === docTypeUni);
        if (t) names = [t.uni as any, (t as any).name, (t as any).displayName].filter(Boolean) as string[];
      } catch {}
      const docs = await odataCache.getDocsByType(docTypeUni, { names });
      console.log(`📄 [DOCS] Loaded ${docs.length} documents:`, docs);
      setDocuments(docs);
      
    } catch (error: any) {
      console.error('❌ [DOCS] Error loading documents:', error);
      setError('Ошибка загрузки документов. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (doc: ODataDocument) => {
    if (doc.finished) {
      return <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Завершён</span>;
    }
    if (doc.inProcess) {
      return <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">В работе</span>;
    }
    return <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">Новый</span>;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📋</div>
          <p className="text-xl text-[#a7a7a7]">Загрузка документов...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Ошибка загрузки</h2>
          <p className="text-[#a7a7a7] mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadDocuments}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Повторить
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quick type chips */}
      {allDocTypes.length > 0 && (
        <div className="flex gap-[8px] overflow-x-auto pb-[4px] -mt-1 items-center">
          {allDocTypes.map((t) => {
            const short = SHORT_TITLES[t.uni] || toShortTitle(String(t.displayName || t.name || t.uni));
            const isActive = t.uni === docTypeUni;
            return (
              <button
                key={t.uni}
                onClick={() => navigate(`/docs/${t.uni}`)}
                className={`chip ${isActive ? 'chip-active' : ''}`}
              >
                {short}
              </button>
            );
          })}
        </div>
      )}

      {/* Status filter chips */}
      <div className="flex gap-[8px] overflow-x-auto pb-[4px] items-center">
        {[
          { key: 'all', label: 'Все' },
          { key: 'new', label: 'Новые' },
          { key: 'in_process', label: 'В работе' },
          { key: 'finished', label: 'Завершён' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key as any)}
            className={`chip ${statusFilter === s.key ? 'chip-active' : ''}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {/* Documents list */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-[#474747] rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl text-[#a7a7a7] mb-2">Нет документов</h3>
          <p className="text-sm text-[#a7a7a7] opacity-80">
            Документы данного типа отсутствуют
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                console.log(`📄 [DOCS] Navigating to document details: /docs/${docTypeUni}/${doc.id}`);
                navigate(`/docs/${docTypeUni}/${doc.id}`);
              }}
              className="w-full bg-[#474747] hover:bg-[#525252] rounded-lg p-4 text-left transition-all border border-[#474747] hover:border-[#666]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#e3e3dd] mb-1">
                    {doc.name || doc.id}
                  </h3>
                  {doc.description && (
                    <p className="text-sm text-[#a7a7a7] mb-2">{doc.description}</p>
                  )}
                </div>
                <div className="ml-4">
                  {getStatusBadge(doc)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-[#a7a7a7]">
                <div>
                  <span className="opacity-70">Создан:</span>
                  <span className="ml-2">{formatDate(doc.createDate)}</span>
                </div>
                <div>
                  <span className="opacity-70">Изменён:</span>
                  <span className="ml-2">{formatDate(doc.lastChangeDate)}</span>
                </div>
                {doc.userName && (
                  <div>
                    <span className="opacity-70">Пользователь:</span>
                    <span className="ml-2">{doc.userName}</span>
                  </div>
                )}
                {doc.warehouseId && (
                  <div>
                    <span className="opacity-70">Склад:</span>
                    <span className="ml-2">{doc.warehouseId}</span>
                  </div>
                )}
              </div>

              {doc.barcode && (
                <div className="mt-3 pt-3 border-t border-[#555]">
                  <span className="text-xs text-[#a7a7a7] opacity-70">Штрихкод:</span>
                  <span className="ml-2 text-sm text-[#e3e3dd] font-mono">{doc.barcode}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsByType;

