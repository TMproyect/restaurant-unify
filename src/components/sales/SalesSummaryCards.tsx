
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { SalesSummary } from '@/services/salesService';

interface SalesSummaryCardsProps {
  salesSummary: SalesSummary | null;
}

const SalesSummaryCards: React.FC<SalesSummaryCardsProps> = ({ salesSummary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm">Ventas del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold">${salesSummary?.daily_total.toFixed(2) || '0.00'}</p>
            {salesSummary?.growth_rate && (
              <div className={`flex items-center ${salesSummary.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {salesSummary.growth_rate >= 0 ? (
                  <TrendingUp size={16} className="mr-1" />
                ) : (
                  <TrendingDown size={16} className="mr-1" />
                )}
                <span className="text-xs font-medium">{salesSummary.growth_rate >= 0 ? '+' : ''}{salesSummary.growth_rate.toFixed(1)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm">Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold">{salesSummary?.transactions_count || '0'}</p>
            <div className="flex items-center text-green-600">
              <TrendingUp size={16} className="mr-1" />
              <span className="text-xs font-medium">+12%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm">Valor Promedio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold">${salesSummary?.average_sale.toFixed(2) || '0.00'}</p>
            <div className="flex items-center text-green-600">
              <TrendingUp size={16} className="mr-1" />
              <span className="text-xs font-medium">+3.5%</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm">Cancelaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold">{salesSummary?.cancellations || '0'}</p>
            <div className="flex items-center text-red-600">
              <TrendingDown size={16} className="mr-1" />
              <span className="text-xs font-medium">-15%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesSummaryCards;
