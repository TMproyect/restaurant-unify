
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, Users, Utensils, Package, Star, 
  ArrowUpRight, ArrowDownRight, Info, Activity, UserRound
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DashboardCard as DashboardCardType } from '@/types/dashboard.types';

const EnhancedDashboardCard: React.FC<DashboardCardType> = ({
  title,
  value,
  subtitle,
  changeValue,
  changeType,
  changeLabel,
  icon,
  color,
  listItems,
  tooltip,
  description,
  trend,
  popularItems
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'dollar-sign':
        return <DollarSign className="h-4 w-4 text-white" />;
      case 'users':
        return <Users className="h-4 w-4 text-white" />;
      case 'user-round':
        return <UserRound className="h-4 w-4 text-white" />;
      case 'utensils':
        return <Utensils className="h-4 w-4 text-white" />;
      case 'package':
        return <Package className="h-4 w-4 text-white" />;
      case 'star':
        return <Star className="h-4 w-4 text-white" />;
      case 'activity':
        return <Activity className="h-4 w-4 text-white" />;
      default:
        return <DollarSign className="h-4 w-4 text-white" />;
    }
  };
  
  const getTrendIcon = (iconName: string) => {
    switch (iconName) {
      case 'arrow-up-right':
        return <ArrowUpRight className="h-3 w-3" />;
      case 'arrow-down-right':
        return <ArrowDownRight className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'green':
        return 'from-green-500 to-green-600';
      case 'purple':
      case 'violet':
        return 'from-purple-500 to-purple-600';
      case 'amber':
        return 'from-amber-500 to-amber-600';
      case 'red':
        return 'from-red-500 to-red-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          {title}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[250px] text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${getColorClass()} flex items-center justify-center`}>
          {getIcon()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <span className={trend.direction === 'up' ? 'text-green-600 flex items-center gap-0.5' : 'text-red-600 flex items-center gap-0.5'}>
              {trend.direction === 'up' ? '+' : ''}{trend.value.toFixed(1)}% 
              {getTrendIcon(trend.icon)}
            </span>
            {trend.label}
          </p>
        )}
        
        {popularItems && popularItems.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium">Top platos:</p>
            <ul className="space-y-1">
              {popularItems.map((item, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
                  {item.name} ({item.quantity})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {listItems && listItems.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-medium">Top platos:</p>
            <ul className="space-y-1">
              {listItems.map((item, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardCard;
