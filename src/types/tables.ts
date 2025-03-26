
export interface RestaurantTable {
  id: string;
  number: number;
  capacity: number;
  zone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TableZone {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export const TableStatusLabels: Record<TableStatus, string> = {
  available: 'Disponible',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  maintenance: 'Mantenimiento'
};

export const TableStatusColors: Record<TableStatus, string> = {
  available: 'bg-green-500',
  occupied: 'bg-red-500',
  reserved: 'bg-blue-500',
  maintenance: 'bg-orange-500'
};
