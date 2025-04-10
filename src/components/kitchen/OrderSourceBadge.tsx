
import React from 'react';
import { Truck, QrCode, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OrderSourceBadgeProps {
  source: 'delivery' | 'qr_table' | 'pos' | null;
}

const OrderSourceBadge: React.FC<OrderSourceBadgeProps> = ({ source }) => {
  // Return nothing if no source
  if (!source) return null;
  
  // Set specific styles and icon based on order source
  let Icon, label, className;
  
  switch (source) {
    case 'delivery':
      Icon = Truck;
      label = 'DELIVERY';
      className = 'bg-blue-100 text-blue-800 border-blue-300 font-semibold';
      break;
    case 'qr_table':
      Icon = QrCode;
      label = 'QR MESA';
      className = 'bg-purple-100 text-purple-800 border-purple-300 font-semibold';
      break;
    case 'pos':
      Icon = CreditCard;
      label = 'POS';
      className = 'bg-green-100 text-green-800 border-green-300 font-semibold';
      break;
    default:
      return null;
  }
  
  return (
    <Badge variant="outline" className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
};

export default OrderSourceBadge;
