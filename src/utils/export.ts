// === 📁 src/utils/export.ts ===
import { BarcodeItem } from '@/types/barcode';

export function exportToCSV(data: BarcodeItem[], filename: string = 'barcodes.csv') {
  const headers = ['ID', 'Barcode', 'Timestamp', 'Type', 'Date'];
  const rows = data.map(item => [
    item.id,
    item.barcode,
    item.timestamp,
    item.type || '',
    new Date(item.timestamp).toLocaleString('ru-RU')
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csv, filename, 'text/csv');
}

export function exportToTXT(data: BarcodeItem[], filename: string = 'barcodes.txt') {
  const text = data.map(item => item.barcode).join('\n');
  downloadFile(text, filename, 'text/plain');
}

export function exportToJSON(data: unknown, filename: string = 'data.json') {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}



