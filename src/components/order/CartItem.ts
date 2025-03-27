
export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  options?: {
    name: string;
    choice: {
      id: string;
      name: string;
      price: number;
    }
  }[];
  notes?: string;
}
