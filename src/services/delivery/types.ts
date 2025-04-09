
import { Order, OrderItem } from '../orders';

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  instructions?: string;
}

export interface DeliveryOrder extends Order {
  address: DeliveryAddress;
  driver_id?: string;
  driver_name?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  phone_number?: string;
}
