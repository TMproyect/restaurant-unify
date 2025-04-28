
import type { Order, OrderItem } from '@/types/order.types';
import { formatCurrency } from '@/lib/utils';

export const formatGeneralOrder = (order: Order, items: OrderItem[]): string => {
  const header = [
    '\x1B\x40',  // Initialize printer
    '\x1B\x61\x01',  // Center alignment
    '=== ORDEN COMPLETA ===\n',
    `Mesa: ${order.table_number || 'N/A'}\n`,
    `Cliente: ${order.customer_name}\n`,
    `Orden #: ${order.id.slice(0, 8)}\n`,
    `Fecha: ${new Date(order.created_at).toLocaleString()}\n`,
    '\x1B\x61\x00',  // Left alignment
    '------------------------\n'
  ].join('');

  const itemsText = items.map(item => 
    `${item.quantity}x ${item.name}\n` +
    (item.notes ? `   Nota: ${item.notes}\n` : '')
  ).join('');

  const footer = [
    '------------------------\n',
    `Total: ${formatCurrency(order.total)}\n`,
    '\x1B\x61\x01',  // Center alignment
    '\n=== GRACIAS POR SU PREFERENCIA ===\n',
    '\x1B\x0C'  // Form feed
  ].join('');

  return header + itemsText + footer;
};

export const formatKitchenOrder = (
  order: Order, 
  items: OrderItem[], 
  kitchenName: string
): string => {
  const header = [
    '\x1B\x40',  // Initialize printer
    '\x1B\x61\x01',  // Center alignment
    `=== COMANDA ${kitchenName.toUpperCase()} ===\n`,
    `Mesa: ${order.table_number || 'N/A'}\n`,
    `Orden #: ${order.id.slice(0, 8)}\n`,
    `Hora: ${new Date(order.created_at).toLocaleTimeString()}\n`,
    '\x1B\x61\x00',  // Left alignment
    '------------------------\n'
  ].join('');

  const itemsText = items.map(item => 
    `${item.quantity}x ${item.name}\n` +
    (item.notes ? `   Nota: ${item.notes}\n` : '')
  ).join('');

  const footer = '\x1B\x0C';  // Form feed

  return header + itemsText + footer;
};

export const formatPaymentReceipt = (
  order: Order, 
  items: OrderItem[],
  paymentDetails: {
    method: string;
    subtotal: number;
    tax: number;
    tip?: number;
    total: number;
  }
): string => {
  const header = [
    '\x1B\x40',  // Initialize printer
    '\x1B\x61\x01',  // Center alignment
    '=== RECIBO DE PAGO ===\n',
    `Mesa: ${order.table_number || 'N/A'}\n`,
    `Cliente: ${order.customer_name}\n`,
    `Orden #: ${order.id.slice(0, 8)}\n`,
    `Fecha: ${new Date().toLocaleString()}\n`,
    '\x1B\x61\x00',  // Left alignment
    '------------------------\n'
  ].join('');

  const itemsText = items.map(item => 
    `${item.quantity}x ${item.name}\n` +
    `   ${formatCurrency(item.price * item.quantity)}\n`
  ).join('');

  const footer = [
    '------------------------\n',
    `Subtotal: ${formatCurrency(paymentDetails.subtotal)}\n`,
    `IVA (18%): ${formatCurrency(paymentDetails.tax)}\n`,
    paymentDetails.tip ? `Propina: ${formatCurrency(paymentDetails.tip)}\n` : '',
    `Total: ${formatCurrency(paymentDetails.total)}\n`,
    `Método de pago: ${paymentDetails.method}\n`,
    '\x1B\x61\x01',  // Center alignment
    '\n=== GRACIAS POR SU VISITA ===\n',
    '\x1B\x0C'  // Form feed
  ].join('');

  return header + itemsText + footer;
};
