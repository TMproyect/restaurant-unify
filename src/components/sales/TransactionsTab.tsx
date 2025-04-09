
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TransactionData } from '@/services/salesService';

interface TransactionsTabProps {
  recentTransactions: TransactionData[];
}

const TransactionsTab: React.FC<TransactionsTabProps> = ({ recentTransactions }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentTransactions.map(transaction => (
            <div key={transaction.id} className="flex justify-between items-center p-3 border-b last:border-0">
              <div>
                <p className="font-medium">#{transaction.id.substring(0, 6)}</p>
                <p className="text-sm text-muted-foreground">{transaction.time} • {transaction.items_count} items</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${transaction.total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{transaction.payment_method} • {transaction.server}</p>
              </div>
            </div>
          ))}
          
          {recentTransactions.length === 0 && (
            <p className="text-center py-4 text-muted-foreground">No hay transacciones recientes</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsTab;
