
import { SavedReport } from './types';

// Get saved reports (returns example data for demonstration)
export const getSavedReports = async (): Promise<SavedReport[]> => {
  // This would normally fetch from a reports table in the database
  return [
    { id: 1, name: 'Ventas Mensuales 2023', date: '2023-12-01', type: 'Excel' },
    { id: 2, name: 'Análisis de Productos Q2', date: '2023-07-15', type: 'PDF' },
    { id: 3, name: 'Rendimiento de Personal', date: '2023-09-30', type: 'Excel' },
    { id: 4, name: 'Inventario Trimestral', date: '2023-10-01', type: 'PDF' },
  ];
};
