
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ClipboardList,
  Package,
  Info,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DashboardCardData } from '@/types/dashboard.types';
import { Link } from 'react-router-dom';

const iconMap: Record<string, React.ReactNode> = {
  'dollar-sign': <DollarSign className="h-5 w-5 text-primary" />,
  'users': <Users className="h-5 w-5 text-primary" />,
  'clipboard-list': <ClipboardList className="h-5 w-5 text-primary" />,
  'package': <Package className="h-5 w-5 text-primary" />
};

interface PopularItemLinkProps {
  name: string;
  value: string;
  link?: string;
}

const PopularItemLink: React.FC<PopularItemLinkProps> = ({ name, value, link }) => {
  if (link) {
    return (
      <Link to={link} className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded transition-colors group">
        <span className="font-medium text-sm truncate">{name}</span>
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground">{value}</span>
          <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
        </div>
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between py-1 px-2">
      <span className="font-medium text-sm truncate">{name}</span>
      <span className="text-sm text-muted-foreground">{value}</span>
    </div>
  );
};

const EnhancedDashboardCard: React.FC<DashboardCardData> = ({
  title,
  value,
  icon,
  subvalue,
  change,
  items,
  tooltip,
  lastUpdated
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="ml-1 inline-flex">
                      <Info className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[250px] text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="rounded-full h-8 w-8 flex items-center justify-center bg-primary/10">
            {iconMap[icon]}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="font-bold text-xl">{value}</div>
          
          {subvalue && (
            <CardDescription>{subvalue}</CardDescription>
          )}
          
          {change && (
            <div className="flex items-center text-xs">
              {change.isPositive ? (
                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {change.value}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {change.value}
                </Badge>
              )}
              <span className="ml-2 text-muted-foreground">{change.description}</span>
            </div>
          )}
          
          {items && items.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="space-y-0.5">
                {items.map((item, idx) => (
                  <PopularItemLink 
                    key={idx} 
                    name={item.name} 
                    value={item.value}
                    link={item.link}
                  />
                ))}
              </div>
            </div>
          )}
          
          {lastUpdated && (
            <div className="text-xs text-muted-foreground mt-2">
              {lastUpdated}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDashboardCard;
