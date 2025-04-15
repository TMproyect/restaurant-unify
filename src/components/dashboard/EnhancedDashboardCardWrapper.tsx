
import React from 'react';
import { DashboardCard } from '@/types/dashboard.types';
import EnhancedDashboardCard from './EnhancedDashboardCard';

// Este componente wrapper garantiza que las propiedades pasadas a EnhancedDashboardCard
// sean exactamente del tipo correcto DashboardCard
const EnhancedDashboardCardWrapper: React.FC<{ cardData: DashboardCard }> = ({ cardData }) => {
  return <EnhancedDashboardCard {...cardData} />;
};

export default EnhancedDashboardCardWrapper;
