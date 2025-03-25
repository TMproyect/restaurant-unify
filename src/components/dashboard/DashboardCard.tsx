
import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  loading?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  className,
  footer,
  loading = false,
}) => {
  return (
    <div 
      className={cn(
        'bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm overflow-hidden card-hover',
        className
      )}
    >
      <div className="p-5 border-b border-border">
        <h3 className="font-medium">{title}</h3>
      </div>
      
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-6 bg-muted rounded animate-loading-pulse" />
            <div className="h-12 bg-muted rounded animate-loading-pulse" />
            <div className="h-6 bg-muted rounded animate-loading-pulse w-2/3" />
          </div>
        ) : (
          children
        )}
      </div>
      
      {footer && (
        <div className="px-5 py-3 bg-muted/30 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
