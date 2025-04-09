
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
  let Icon, label, badgeVariant;
  
  switch (source) {
    case 'delivery':
      Icon = Truck;
      label = 'DELIVERY';
      badgeVariant = 'delivery';
      break;
    case 'qr_table':
      Icon = QrCode;
      label = 'QR MESA';
      badgeVariant = 'qr';
      break;
    case 'pos':
      Icon = CreditCard;
      label = 'POS';
      badgeVariant = 'pos';
      break;
    default:
      return null;
  }
  
  // Get appropriate styles based on the source
  const getBadgeClasses = () => {
    switch (source) {
      case 'delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-semibold hover:bg-blue-200';
      case 'qr_table':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-semibold hover:bg-purple-200';
      case 'pos':
        return 'bg-green-100 text-green-800 border-green-300 font-semibold hover:bg-green-200';
      default:
        return '';
    }
  };
  
  return (
    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${getBadgeClasses()}`}>
      <Icon size={14} className="flex-shrink-0" />
      <span className="font-bold">{label}</span>
    </div>
  );
};

export default OrderSourceBadge;
