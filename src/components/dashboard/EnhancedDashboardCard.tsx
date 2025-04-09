
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ClipboardList,
  Info,
  ExternalLink
} from 'lucide-react';
import { DashboardCardData } from '@/types/dashboard.types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Icon component for the card
const CardIcon: React.FC<{ icon: string }> = ({ icon }) => {
  const iconSize = 'h-4 w-4 text-white';
  
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

// Get gradient for card based on icon type
const getCardGradient = (icon: string): { bg: string, iconBg: string, textColor: string } => {
  switch (icon) {
    case 'dollar-sign':
      return {
        bg: 'from-blue-50 to-purple-50',
        iconBg: 'from-blue-500 to-purple-500',
        textColor: 'text-purple-800'
      };
    case 'clipboard-list':
      return {
        bg: 'from-green-50 to-teal-50',
        iconBg: 'from-green-500 to-teal-500',
        textColor: 'text-teal-800'
      };
    case 'package':
      return {
        bg: 'from-amber-50 to-orange-50',
        iconBg: 'from-amber-500 to-orange-500',
        textColor: 'text-amber-800'
      };
    case 'users':
      return {
        bg: 'from-indigo-50 to-violet-50',
        iconBg: 'from-indigo-500 to-violet-500',
        textColor: 'text-indigo-800'
      };
    default:
      return {
        bg: 'from-gray-50 to-gray-100',
        iconBg: 'from-gray-500 to-gray-600',
        textColor: 'text-gray-800'
      };
  }
};

export const EnhancedDashboardCard: React.FC<DashboardCardData> = ({ 
  title, 
  value, 
  icon, 
  change, 
  details,
  subvalue,
  lastUpdated,
  tooltip,
  items
}) => {
  const { bg, iconBg, textColor } = getCardGradient(icon);
  
  return (
    <Card className={`overflow-hidden border-none shadow-md bg-gradient-to-br ${bg} hover:shadow-lg transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${textColor} flex items-center gap-1`}>
          {title}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${iconBg} flex items-center justify-center`}>
          <CardIcon icon={icon} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        
        {subvalue && (
          <p className="text-xs text-gray-600 mt-1">{subvalue}</p>
        )}
        
        {change && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
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
        
        {items && items.length > 0 && (
          <div className="mt-2 space-y-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                {item.link ? (
                  <Link 
                    to={item.link} 
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    {item.name}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                ) : (
                  <span>{item.name}</span>
                )}
                <span className="text-gray-600">{item.value}</span>
              </div>
            ))}
          </div>
        )}
        
        {details && (
          <p className="text-xs text-muted-foreground mt-1">
            {details}
          </p>
        )}
        
        {lastUpdated && (
          <p className="text-xs text-gray-400 mt-2 italic">
            {lastUpdated}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardCard;
