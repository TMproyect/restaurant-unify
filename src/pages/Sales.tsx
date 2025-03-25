
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

// Datos de ejemplo para ventas
const dailySalesData = [
  { day: 'Lun', sales: 1200 },
  { day: 'Mar', sales: 1900 },
  { day: 'Mie', sales: 1400 },
  { day: 'Jue', sales: 1600 },
  { day: 'Vie', sales: 2400 },
  { day: 'Sab', sales: 2800 },
  { day: 'Dom', sales: 2200 },
];

const productSalesData = [
  { name: 'Pizza Margherita', sales: 45 },
  { name: 'Pasta Carbonara', sales: 38 },
  { name: 'Tiramisu', sales: 32 },
  { name: 'Ensalada César', sales: 28 },
  { name: 'Pollo a la Parrilla', sales: 25 },
];

const recentTransactions = [
  { id: '1001', time: '15:42', items: 3, total: '$42.50', payment: 'Tarjeta', server: 'Ana L.' },
  { id: '1002', time: '15:35', items: 2, total: '$28.75', payment: 'Efectivo', server: 'Carlos M.' },
  { id: '1003', time: '15:21', items: 1, total: '$18.90', payment: 'Tarjeta', server: 'Ana L.' },
  { id: '1004', time: '15:12', items: 5, total: '$63.20', payment: 'Aplicación', server: 'Miguel P.' },
  { id: '1005', time: '14:58', items: 2, total: '$25.40', payment: 'Efectivo', server: 'Carlos M.' },
];

const Sales = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Ventas</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select defaultValue="daily">
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download size={16} /> Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Ventas del Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">$3,548.20</p>
                <div className="flex items-center text-green-600">
                  <TrendingUp size={16} className="mr-1" />
                  <span className="text-xs font-medium">+8.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm">Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold">48</p>
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
                <p className="text-2xl font-bold">$73.92</p>
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
                <p className="text-2xl font-bold">2</p>
                <div className="flex items-center text-red-600">
                  <TrendingDown size={16} className="mr-1" />
                  <span className="text-xs font-medium">-15%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="products">Por Producto</TabsTrigger>
            <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ventas de la Semana</CardTitle>
                <CardDescription>Un resumen de las ventas diarias de la última semana</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailySalesData}>
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
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
                <CardDescription>Los 5 productos más vendidos del día</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productSalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#82ca9d" name="Unidades Vendidas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transacciones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentTransactions.map(transaction => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">#{transaction.id}</p>
                        <p className="text-sm text-muted-foreground">{transaction.time} • {transaction.items} items</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{transaction.total}</p>
                        <p className="text-sm text-muted-foreground">{transaction.payment} • {transaction.server}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Sales;
