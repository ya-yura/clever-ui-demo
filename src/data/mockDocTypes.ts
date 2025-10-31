// === 📁 src/data/mockDocTypes.ts ===
// Mock document types for fallback when API is not available

import { ODataDocumentType } from '@/types/odata';

export const MOCK_DOC_TYPES: ODataDocumentType[] = [
  {
    id: '1',
    uni: 'PrihodNaSklad',
    name: 'Приход на склад',
    displayName: 'Приход на склад',
    buttonColor: '#daa420',
    imageFileId: '',
  },
  {
    id: '2',
    uni: 'RazmeshhenieVYachejki',
    name: 'Размещение в ячейки',
    displayName: 'Размещение в ячейки',
    buttonColor: '#fea079',
    imageFileId: '',
  },
  {
    id: '3',
    uni: 'PodborZakaza',
    name: 'Подбор заказа',
    displayName: 'Подбор заказа',
    buttonColor: '#f3a361',
    imageFileId: '',
  },
  {
    id: '4',
    uni: 'Otgruzka',
    name: 'Отгрузка',
    displayName: 'Отгрузка',
    buttonColor: '#86e0cb',
    imageFileId: '',
  },
  {
    id: '5',
    uni: 'Inventarizaciya',
    name: 'Инвентаризация',
    displayName: 'Инвентаризация',
    buttonColor: '#91ed91',
    imageFileId: '',
  },
  {
    id: '6',
    uni: 'Vozvrat',
    name: 'Возврат',
    displayName: 'Возврат',
    buttonColor: '#ba8f8e',
    imageFileId: '',
  },
  {
    id: '7',
    uni: 'Peremeshhenie',
    name: 'Перемещение',
    displayName: 'Перемещение',
    buttonColor: '#f0e78d',
    imageFileId: '',
  },
  {
    id: '8',
    uni: 'Markirovka',
    name: 'Маркировка',
    displayName: 'Маркировка',
    buttonColor: 'burlywood',
    imageFileId: '',
  },
];

