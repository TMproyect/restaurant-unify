
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesOverviewTabProps {
  salesData: any[];
}

const SalesOverviewTab: React.FC<SalesOverviewTabProps> = ({ salesData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas de la Semana</CardTitle>
        <CardDescription>Un resumen de las ventas diarias de la última semana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} name="Ventas ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesOverviewTab;
