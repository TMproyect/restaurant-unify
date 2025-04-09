
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';

interface SalesOverviewTabProps {
  salesData: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-sm">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-blue-500">{`Ventas: $${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const SalesOverviewTab: React.FC<SalesOverviewTabProps> = ({ salesData }) => {
  if (!salesData || salesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventas de la Semana</CardTitle>
          <CardDescription>Un resumen de las ventas diarias de la última semana</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <AlertCircle className="h-10 w-10 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No hay datos de ventas</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No se encontraron datos de ventas para el período seleccionado. 
            Intente cambiar el período o la fecha seleccionada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas de la Semana</CardTitle>
        <CardDescription>Un resumen de las ventas diarias de la última semana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
                name="Ventas ($)" 
                strokeWidth={2}
                dot={{ strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesOverviewTab;
