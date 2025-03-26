
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
