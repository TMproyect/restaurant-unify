
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

interface LoadingCardsProps {
  count?: number;
}

const LoadingCards: React.FC<LoadingCardsProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse border border-gray-100">
          <CardHeader className="flex flex-row justify-between pb-2">
            <div className="h-5 w-24 bg-gray-200 rounded"></div>
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default LoadingCards;
