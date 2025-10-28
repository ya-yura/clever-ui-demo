// === 📁 src/components/ScannerInput.tsx ===
// Scanner input component for hardware barcode scanners (keyboard emulation mode)

import React, { useRef, useEffect } from 'react';

interface ScannerInputProps {
  onScan: (code: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  hint?: string;
}

const ScannerInput: React.FC<ScannerInputProps> = ({
  onScan,
  placeholder = 'Отсканируйте штрих-код...',
  autoFocus = true,
  className = '',
  hint,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount and when component updates
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Re-focus if lost
  useEffect(() => {
    if (!autoFocus) return;

    const handleFocusLoss = () => {
      setTimeout(() => {
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    };

    window.addEventListener('click', handleFocusLoss);
    return () => window.removeEventListener('click', handleFocusLoss);
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter key
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      
      const value = inputRef.current?.value.trim();
      
      if (value && value.length > 0) {
        // Call onScan handler
        onScan(value);
        
        // Clear input
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
      
      // Return focus to input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  const handleBlur = () => {
    // Auto-refocus after a short delay
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className={`scanner-input-wrapper ${className}`}>
      <div className="card bg-[#2d7a6b] border-2 border-[#86e0cb]">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 text-3xl">
            📷
          </div>
          <div className="flex-1">
            <label htmlFor="scanner-input" className="block text-xs font-semibold text-[#86e0cb] mb-1">
              СКАНЕР
            </label>
            <input
              ref={inputRef}
              id="scanner-input"
              type="text"
              placeholder={placeholder}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full bg-[#343436] border border-[#474747] rounded px-3 py-2 text-[#e3e3dd] placeholder-[#a7a7a7] focus:outline-none focus:ring-2 focus:ring-[#86e0cb] focus:border-transparent"
            />
            {hint && (
              <p className="text-xs text-[#86e0cb] mt-1">
                💡 {hint}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerInput;

