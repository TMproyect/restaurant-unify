
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { AlertCircle, DollarSign, Clock } from 'lucide-react';
import { TransactionData } from '@/services/salesService';
import { Badge } from '@/components/ui/badge';

interface TransactionsTabProps {
  recentTransactions: TransactionData[];
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'completado':
    case 'paid':
    case 'pagado':
    case 'delivered':
    case 'entregado':
      return <Badge className="bg-green-500">Completado</Badge>;
    case 'cancelled':
    case 'cancelado':
      return <Badge variant="destructive">Cancelado</Badge>;
    case 'pending':
    case 'pendiente':
      return <Badge variant="outline" className="border-amber-500 text-amber-500">Pendiente</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const TransactionsTab: React.FC<TransactionsTabProps> = ({ recentTransactions }) => {
  if (!recentTransactions || recentTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>Registro de ventas recientes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <AlertCircle className="h-10 w-10 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No hay transacciones recientes</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No se encontraron transacciones para el período seleccionado. 
            Intente cambiar el período o la fecha seleccionada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transacciones Recientes</CardTitle>
        <CardDescription>Registro de ventas recientes</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Artículos</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.customer_name}</TableCell>
                <TableCell className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {transaction.date}
                </TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell>{transaction.items_count}</TableCell>
                <TableCell className="text-right font-medium flex items-center justify-end gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  {transaction.total.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionsTab;
