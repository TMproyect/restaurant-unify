
import React from 'react';
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { ActivityMonitorItem } from '@/types/dashboard.types';

interface CustomerInfoCardProps {
  order: ActivityMonitorItem;
}

const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({ order }) => {
  // Check if the customer has valid data
  const hasCustomerData = order.customer && 
    order.customer !== 'Unknown' && 
    order.customer !== 'N/A';
  
  if (!hasCustomerData) return null;
  
  return (
    <Card className="p-4 bg-slate-50">
      <div className="flex items-center space-x-2 mb-2">
        <User className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-medium">Información del Cliente</h3>
      </div>
      <p className="text-sm">{order.customer}</p>
      <p className="text-xs text-muted-foreground mt-2">
        No se puede contactar al cliente por esta plataforma
      </p>
    </Card>
  );
};

export default CustomerInfoCard;
