// === 📁 src/data/mockDocTypes.ts ===
// Mock document types for fallback when API is not available

import { ODataDocumentType } from '@/types/odata';

const DEFAULT_DOC_TYPE: ODataDocumentType = {
  id: '',
  uni: '',
  name: '',
  displayName: '',
  filePath: '',
  clientCreating: false,
  autoCreateNewDocument: false,
  autoStartNewDocumentCreation: false,
  autoStartNewDocumentCreationForEmptyList: false,
  autoOpenSigleDocument: false,
  inaccessibleForDocumentAbsence: false,
  showDeclaredQuantities: false,
  alias: undefined,
  input: true,
  output: false,
  labelTypeName: '',
  manualDocumentSelection: true,
  barcodeDocumentSelection: true,
  checkServerBarcodes: true,
  cyclic: false,
  manualExit: true,
  fullscreen: false,
  buttonColor: '#64748b',
  visible: 'true',
  enabled: 'true',
};

const createMockDocType = (overrides: Partial<ODataDocumentType>): ODataDocumentType => ({
  ...DEFAULT_DOC_TYPE,
  ...overrides,
});

export const MOCK_DOC_TYPES: ODataDocumentType[] = [
  createMockDocType({
    id: '1',
    uni: 'PrihodNaSklad',
    name: 'Приход на склад',
    displayName: 'Приход на склад',
    buttonColor: '#daa420',
  }),
  createMockDocType({
    id: '2',
    uni: 'RazmeshhenieVYachejki',
    name: 'Размещение в ячейки',
    displayName: 'Размещение в ячейки',
    buttonColor: '#fea079',
  }),
  createMockDocType({
    id: '3',
    uni: 'PodborZakaza',
    name: 'Подбор заказа',
    displayName: 'Подбор заказа',
    buttonColor: '#f3a361',
  }),
  createMockDocType({
    id: '4',
    uni: 'Otgruzka',
    name: 'Отгрузка',
    displayName: 'Отгрузка',
    buttonColor: '#86e0cb',
  }),
  createMockDocType({
    id: '5',
    uni: 'Inventarizaciya',
    name: 'Инвентаризация',
    displayName: 'Инвентаризация',
    buttonColor: '#91ed91',
  }),
  createMockDocType({
    id: '6',
    uni: 'Vozvrat',
    name: 'Возврат',
    displayName: 'Возврат',
    buttonColor: '#ba8f8e',
  }),
  createMockDocType({
    id: '7',
    uni: 'Peremeshhenie',
    name: 'Перемещение',
    displayName: 'Перемещение',
    buttonColor: '#f0e78d',
  }),
  createMockDocType({
    id: '8',
    uni: 'Markirovka',
    name: 'Маркировка',
    displayName: 'Маркировка',
    buttonColor: 'burlywood',
  }),
];

