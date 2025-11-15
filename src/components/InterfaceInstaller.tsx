/**
 * Interface Installer Component
 * 
 * Позволяет загрузить кастомный интерфейс тремя способами:
 * 1. Сканирование QR-кода
 * 2. Загрузка JSON-файла
 * 3. Вставка JSON-кода (copy-paste)
 */

import { useState } from 'react';
import { X, QrCode, Upload, FileJson } from 'lucide-react';
import { SchemaLoader } from '../services/schemaLoader';
import { QRScanner } from './QRScanner';
import analytics from '../analytics';
import type { UISchema } from '../types/ui-schema';
import { validateSchema } from '../types/ui-schema';

interface InterfaceInstallerProps {
  onClose: () => void;
  onSuccess?: (schema: UISchema) => void;
}

type LoadMethod = 'qr' | 'file' | 'text';

export const InterfaceInstaller: React.FC<InterfaceInstallerProps> = ({ 
  onClose, 
  onSuccess 
}) => {
  const [activeMethod, setActiveMethod] = useState<LoadMethod>('qr');
  const [showScanner, setShowScanner] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle QR code scan
  const handleQRScan = (data: string) => {
    console.log('📱 QR data received:', data.substring(0, 100) + '...');
    setLoading(true);
    setError(null);

    try {
      const schema = SchemaLoader.loadFromCompressed(data);
      
      if (schema) {
        // Save to localStorage as 'active' schema
        SchemaLoader.saveToLocalStorage(schema, 'active');
        
        // Dispatch event to notify Home component
        window.dispatchEvent(new Event('interface-installed'));
        
        // Track successful load
        analytics.trackCustomInterfaceQRScan(true);
        analytics.trackCustomInterfaceLoaded({
          id: schema.metadata?.name || 'unknown',
          version: '1.0.0',
          buttonsCount: schema.buttons?.length || 0,
          source: 'qr',
        });
        
        setShowScanner(false);
        
        if (onSuccess) {
          onSuccess(schema);
        }
        
        alert('✅ Интерфейс успешно загружен!');
        onClose();
      } else {
        throw new Error('Invalid schema format');
      }
    } catch (err: any) {
      console.error('QR scan error:', err);
      setError(`Ошибка: ${err.message}`);
      analytics.trackCustomInterfaceQRScan(false, err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📁 File selected:', file.name);
    setLoading(true);
    setError(null);

    try {
      const schema = await SchemaLoader.loadFromFile(file);
      
      if (schema) {
        // Save to localStorage as 'active' schema
        SchemaLoader.saveToLocalStorage(schema, 'active');
        
        // Dispatch event to notify Home component
        window.dispatchEvent(new Event('interface-installed'));
        
        // Track successful load
        analytics.trackCustomInterfaceLoaded({
          id: schema.metadata?.name || 'unknown',
          version: '1.0.0',
          buttonsCount: schema.buttons?.length || 0,
          source: 'file',
        });
        
        if (onSuccess) {
          onSuccess(schema);
        }
        
        alert('✅ Интерфейс успешно загружен!');
        onClose();
      } else {
        throw new Error('Invalid JSON schema');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(`Ошибка загрузки файла: ${err.message}`);
      analytics.trackError(err, { component: 'InterfaceInstaller', method: 'file' });
    } finally {
      setLoading(false);
    }
  };

  // Handle text paste
  const handleTextPaste = () => {
    if (!jsonText.trim()) {
      setError('Введите JSON-код интерфейса');
      return;
    }

    console.log('📝 Processing pasted JSON:', jsonText.substring(0, 100) + '...');
    setLoading(true);
    setError(null);

    try {
      // Try to parse as regular JSON
      let schema: UISchema | null = null;
      
      try {
        schema = JSON.parse(jsonText);
      } catch {
        // If failed, try as compressed
        schema = SchemaLoader.loadFromCompressed(jsonText);
      }
      
      if (schema) {
        // Validate schema
        if (!validateSchema(schema)) {
          throw new Error('Schema validation failed');
        }
        
        // Save to localStorage as 'active' schema
        SchemaLoader.saveToLocalStorage(schema, 'active');
        
        // Dispatch event to notify Home component
        window.dispatchEvent(new Event('interface-installed'));
        
        // Track successful load
        analytics.trackCustomInterfaceLoaded({
          id: schema.metadata?.name || 'unknown',
          version: '1.0.0',
          buttonsCount: schema.buttons?.length || 0,
          source: 'qr', // Using 'qr' as it's compressed
        });
        
        if (onSuccess) {
          onSuccess(schema);
        }
        
        alert('✅ Интерфейс успешно загружен!');
        onClose();
      } else {
        throw new Error('Invalid schema format');
      }
    } catch (err: any) {
      console.error('Text paste error:', err);
      setError(`Ошибка: ${err.message}`);
      analytics.trackError(err, { component: 'InterfaceInstaller', method: 'text' });
    } finally {
      setLoading(false);
    }
  };

  // Clear current interface (reset to standard)
  const handleClearInterface = () => {
    if (confirm('Удалить текущий кастомный интерфейс и вернуться к стандартному?')) {
      SchemaLoader.deleteFromLocalStorage('active');
      SchemaLoader.deleteFromLocalStorage('default');
      
      alert('✅ Интерфейс сброшен!\nПерезагрузите страницу для применения.');
      onClose();
    }
  };

  // If scanner is active, show it
  if (showScanner) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#1C1E21',
        zIndex: 10000,
      }}>
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        background: '#2A2A2C',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #3D4247',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 700,
            color: '#FFFFFF',
          }}>
            Установить интерфейс
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              color: '#A7A7A7',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Method tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '16px 24px',
          borderBottom: '1px solid #3D4247',
          overflowX: 'auto',
        }}>
          <button
            onClick={() => setActiveMethod('qr')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeMethod === 'qr' ? '#F3A36A' : '#3D4247',
              color: activeMethod === 'qr' ? '#8B5931' : '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <QrCode size={18} />
            QR-код
          </button>
          <button
            onClick={() => setActiveMethod('file')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeMethod === 'file' ? '#F3A36A' : '#3D4247',
              color: activeMethod === 'file' ? '#8B5931' : '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <Upload size={18} />
            Файл
          </button>
          <button
            onClick={() => setActiveMethod('text')}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: activeMethod === 'text' ? '#F3A36A' : '#3D4247',
              color: activeMethod === 'text' ? '#8B5931' : '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <FileJson size={18} />
            Текст
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* QR Code method */}
          {activeMethod === 'qr' && (
            <div>
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📱</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: '8px',
                }}>
                  Сканирование QR-кода
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#A7A7A7',
                  marginBottom: '24px',
                  lineHeight: '1.5',
                }}>
                  Отсканируйте QR-код с конфигурацией интерфейса из приложения Constructor
                </p>
                <button
                  onClick={() => setShowScanner(true)}
                  disabled={loading}
                  style={{
                    padding: '16px 32px',
                    background: '#F3A36A',
                    color: '#8B5931',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Загрузка...' : 'Открыть сканер'}
                </button>
              </div>
            </div>
          )}

          {/* File upload method */}
          {activeMethod === 'file' && (
            <div>
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📁</div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: '8px',
                }}>
                  Загрузка JSON-файла
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#A7A7A7',
                  marginBottom: '24px',
                  lineHeight: '1.5',
                }}>
                  Выберите файл с конфигурацией интерфейса (.json)
                </p>
                <label style={{
                  display: 'inline-block',
                  padding: '16px 32px',
                  background: '#F3A36A',
                  color: '#8B5931',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}>
                  {loading ? 'Загрузка...' : 'Выбрать файл'}
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    disabled={loading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Text paste method */}
          {activeMethod === 'text' && (
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '12px',
              }}>
                Вставьте JSON-код или сжатую строку
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#A7A7A7',
                marginBottom: '16px',
                lineHeight: '1.5',
              }}>
                Скопируйте JSON-конфигурацию или сжатую строку из приложения Constructor и вставьте ниже
              </p>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{"id":"my-interface","version":"1.0.0",...}'
                disabled={loading}
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '12px',
                  background: '#1C1E21',
                  border: '1px solid #3D4247',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  marginBottom: '16px',
                }}
              />
              <button
                onClick={handleTextPaste}
                disabled={loading || !jsonText.trim()}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#F3A36A',
                  color: '#8B5931',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: loading || !jsonText.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !jsonText.trim() ? 0.6 : 1,
                }}
              >
                {loading ? 'Загрузка...' : 'Установить интерфейс'}
              </button>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: '8px',
              color: '#FF3B30',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          {/* Clear interface button */}
          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #3D4247',
          }}>
            <button
              onClick={handleClearInterface}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: '1px solid rgba(255, 59, 48, 0.5)',
                borderRadius: '8px',
                color: '#FF3B30',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Сбросить интерфейс (вернуться к стандартному)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

