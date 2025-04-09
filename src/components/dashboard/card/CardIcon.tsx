
import React from 'react';
import { DollarSign, Users, Package, ClipboardList } from 'lucide-react';

interface CardIconProps {
  icon: string;
}

const CardIcon: React.FC<CardIconProps> = ({ icon }) => {
  const iconSize = 'h-4 w-4';
  
  switch (icon) {
    case 'dollar-sign':
      return <DollarSign className={iconSize} />;
    case 'users':
      return <Users className={iconSize} />;
    case 'package':
      return <Package className={iconSize} />;
    case 'clipboard-list':
      return <ClipboardList className={iconSize} />;
    default:
      return <DollarSign className={iconSize} />;
  }
};

export default CardIcon;
