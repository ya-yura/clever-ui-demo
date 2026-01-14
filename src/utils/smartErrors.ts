// === 📁 src/utils/smartErrors.ts ===
// Smart error system with explanations and actions

export interface SmartError {
  code: string;
  title: string;
  message: string;
  explanation: string;
  solution: string;
  actions?: ErrorAction[];
  severity: 'error' | 'warning' | 'info';
}

export interface ErrorAction {
  label: string;
  action: () => void | Promise<void>;
  primary?: boolean;
}

/**
 * Smart Error Registry
 */
export class SmartErrorService {
  private static errorRegistry: Record<string, Omit<SmartError, 'actions'>> = {
    // Scanning errors
    PRODUCT_NOT_FOUND: {
      code: 'PRODUCT_NOT_FOUND',
      title: 'Товар не найден',
      message: 'Отсканированный штрихкод не найден в системе',
      explanation: 'Этот товар отсутствует в справочнике или штрихкод некорректный',
      solution: 'Проверьте штрихкод и попробуйте снова, или добавьте товар вручную',
      severity: 'error',
    },
    PRODUCT_NOT_IN_DOCUMENT: {
      code: 'PRODUCT_NOT_IN_DOCUMENT',
      title: 'Товар не в документе',
      message: 'Отсканированный товар не входит в текущий документ',
      explanation: 'Вы сканируете товар, которого нет в списке документа',
      solution: 'Убедитесь, что работаете с правильным документом, или проверьте содержимое документа',
      severity: 'warning',
    },
    CELL_NOT_FOUND: {
      code: 'CELL_NOT_FOUND',
      title: 'Ячейка не найдена',
      message: 'Указанная ячейка не существует на складе',
      explanation: 'Ячейка с таким адресом не зарегистрирована в системе',
      solution: 'Проверьте адрес ячейки или создайте новую ячейку в системе',
      severity: 'error',
    },
    QUANTITY_EXCEEDED: {
      code: 'QUANTITY_EXCEEDED',
      title: 'Превышено количество',
      message: 'Отсканировано больше товара, чем указано в документе',
      explanation: 'Количество отсканированных позиций превышает ожидаемое',
      solution: 'Проверьте количество в документе или уточните у руководителя',
      severity: 'warning',
    },
    DOCUMENT_COMPLETED: {
      code: 'DOCUMENT_COMPLETED',
      title: 'Документ завершён',
      message: 'Невозможно редактировать завершённый документ',
      explanation: 'Этот документ уже завершён и заблокирован для изменений',
      solution: 'Создайте новый документ или попросите руководителя отменить завершение',
      severity: 'info',
    },
    NO_INTERNET: {
      code: 'NO_INTERNET',
      title: 'Нет подключения',
      message: 'Отсутствует соединение с сервером',
      explanation: 'Приложение работает в оффлайн режиме. Данные будут синхронизированы позже',
      solution: 'Продолжайте работу. Изменения сохранятся локально и отправятся при восстановлении связи',
      severity: 'warning',
    },
    SYNC_FAILED: {
      code: 'SYNC_FAILED',
      title: 'Ошибка синхронизации',
      message: 'Не удалось синхронизировать данные с сервером',
      explanation: 'Возникла проблема при передаче данных на сервер',
      solution: 'Проверьте интернет-соединение и попробуйте синхронизировать позже',
      severity: 'error',
    },
    PERMISSION_DENIED: {
      code: 'PERMISSION_DENIED',
      title: 'Доступ запрещён',
      message: 'У вас нет прав для выполнения этого действия',
      explanation: 'Данное действие доступно только пользователям с определёнными правами',
      solution: 'Обратитесь к руководителю для получения необходимых прав',
      severity: 'error',
    },
    DUPLICATE_SCAN: {
      code: 'DUPLICATE_SCAN',
      title: 'Повторное сканирование',
      message: 'Этот товар уже был отсканирован',
      explanation: 'Вы уже сканировали этот товар в текущей сессии',
      solution: 'Если нужно добавить ещё один экземпляр, подтвердите действие',
      severity: 'info',
    },
    INVALID_FORMAT: {
      code: 'INVALID_FORMAT',
      title: 'Неверный формат',
      message: 'Отсканированные данные имеют неверный формат',
      explanation: 'Штрихкод или QR-код не соответствует ожидаемому формату',
      solution: 'Проверьте качество печати или попробуйте ввести данные вручную',
      severity: 'error',
    },
  };

  /**
   * Create a smart error with actions
   */
  static createError(
    code: string,
    customMessage?: string,
    actions?: ErrorAction[]
  ): SmartError {
    const template = this.errorRegistry[code];
    
    if (!template) {
      return {
        code: 'UNKNOWN_ERROR',
        title: 'Неизвестная ошибка',
        message: customMessage || 'Произошла неизвестная ошибка',
        explanation: 'Подробности ошибки недоступны',
        solution: 'Обратитесь в техподдержку',
        severity: 'error',
        actions,
      };
    }

    return {
      ...template,
      message: customMessage || template.message,
      actions,
    };
  }

  /**
   * Get error by code
   */
  static getError(code: string): SmartError | null {
    const template = this.errorRegistry[code];
    return template ? { ...template, actions: [] } : null;
  }

  /**
   * Register custom error
   */
  static registerError(error: Omit<SmartError, 'actions'>): void {
    this.errorRegistry[error.code] = error;
  }
}

/**
 * Common error actions factory
 */
export class ErrorActions {
  static retry(callback: () => void | Promise<void>): ErrorAction {
    return {
      label: 'Повторить',
      action: callback,
      primary: true,
    };
  }

  static goBack(navigate: (path: string) => void): ErrorAction {
    return {
      label: 'Назад',
      action: () => navigate(-1 as any),
    };
  }

  static goHome(navigate: (path: string) => void): ErrorAction {
    return {
      label: 'На главную',
      action: () => navigate('/'),
    };
  }

  static refresh(): ErrorAction {
    return {
      label: 'Обновить',
      action: () => window.location.reload(),
    };
  }

  static createNew(navigate: (path: string) => void, type: string): ErrorAction {
    return {
      label: 'Создать новый',
      action: () => navigate(`/docs/${type}/new`),
      primary: true,
    };
  }

  static viewDocument(navigate: (path: string) => void, id: string, type: string): ErrorAction {
    return {
      label: 'Открыть документ',
      action: () => navigate(`/docs/${type}/${id}`),
      primary: true,
    };
  }

  static contactSupport(): ErrorAction {
    return {
      label: 'Связаться с поддержкой',
      action: () => {
        // In production, open support chat or email
        alert('Поддержка: support@cleverence.ru');
      },
    };
  }
}

// Convenience exports
export const createError = SmartErrorService.createError.bind(SmartErrorService);
export const getError = SmartErrorService.getError.bind(SmartErrorService);
export const registerError = SmartErrorService.registerError.bind(SmartErrorService);























