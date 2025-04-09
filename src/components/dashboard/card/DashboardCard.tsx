
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardCardData } from '@/types/dashboard.types';
import CardIcon from './CardIcon';
import { getCardGradient } from './dashboardCardStyles';

const DashboardCard: React.FC<DashboardCardData> = ({ 
  title, 
  value, 
  icon, 
  change, 
  subvalue 
}) => {
  const { bg, iconBg, textColor } = getCardGradient(icon);
  
  return (
    <Card className={`overflow-hidden border-none shadow-md bg-gradient-to-br ${bg} hover:shadow-lg transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${textColor}`}>
          {title}
        </CardTitle>
        <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${iconBg} flex items-center justify-center`}>
          <CardIcon icon={icon} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        
        {change && (
          <p className="text-xs text-muted-foreground flex items-center">
            <span className={`inline-flex items-center ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change.isPositive ? 
                <TrendingUp className="h-3 w-3 mr-1" /> : 
                <TrendingDown className="h-3 w-3 mr-1" />
              }
              {change.value}
            </span>
            {' '}{change.description}
          </p>
        )}
        
        {subvalue && (
          <p className="text-xs text-muted-foreground mt-1">
            {subvalue}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
