
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const MenuLoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={`skeleton-${index}`} className="overflow-hidden">
          <div className="h-44 bg-muted animate-pulse"></div>
          <CardHeader className="pb-2">
            <div className="h-6 bg-muted animate-pulse rounded w-3/4"></div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-4 bg-muted animate-pulse rounded mb-2"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
          </CardContent>
          <CardFooter>
            <div className="h-9 bg-muted animate-pulse rounded w-full"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MenuLoadingSkeleton;
