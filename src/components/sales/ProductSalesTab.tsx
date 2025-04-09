
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle } from 'lucide-react';

interface ProductSalesTabProps {
  productSalesData: any[];
}

const ProductSalesTab: React.FC<ProductSalesTabProps> = ({ productSalesData }) => {
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];
  
  if (!productSalesData || productSalesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
          <CardDescription>Los productos con mayor volumen de ventas</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-center">
          <AlertCircle className="h-10 w-10 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">No hay datos suficientes</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No se encontraron datos de ventas de productos para el período seleccionado. 
            Intente cambiar el período o la fecha seleccionada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>Los productos con mayor volumen de ventas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={productSalesData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip 
                formatter={(value: any) => [`${value} unidades`, 'Cantidad']}
                labelFormatter={(value) => `Producto: ${value}`} 
              />
              <Bar dataKey="sales" fill="#8884d8" name="Unidades vendidas">
                {productSalesData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSalesTab;
