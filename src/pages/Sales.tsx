
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  getSalesByPeriod, 
  getDailySalesSummary, 
  getMostSoldProducts, 
  getRecentTransactions,
  subscribeToSalesUpdates,
  type SalesSummary,
  type TransactionData
} from '@/services/salesService';
import { useToast } from '@/hooks/use-toast';

const Sales = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [productSalesData, setProductSalesData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionData[]>([]);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadSalesData();
    
    // Subscribe to sales updates
    const unsubscribe = subscribeToSalesUpdates(() => {
      // Refresh data when sales are updated
      loadSalesData();
      toast({
        title: "Datos actualizados",
        description: "Se han detectado nuevas ventas"
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Reload data when date or period changes
  useEffect(() => {
    loadSalesData();
  }, [date, period]);

  const loadSalesData = async () => {
    setIsLoading(true);
    try {
      // Get selected date in string format
      const dateStr = date ? format(date, 'yyyy-MM-dd') : undefined;
      
      // Load daily summary
      const summary = await getDailySalesSummary(dateStr);
      setSalesSummary(summary);
      
      // Load sales by period
      const periodData = await getSalesByPeriod(period, 7);
      const formattedPeriodData = periodData.map(item => ({
        day: new Date(item.date).toLocaleDateString('es', { weekday: 'short' }),
        sales: item.total
      }));
      setSalesData(formattedPeriodData);
      
      // Load most sold products
      const products = await getMostSoldProducts(5, period === 'daily' ? 1 : period === 'weekly' ? 7 : 30);
      const formattedProducts = products.map(product => ({
        name: product.product_name,
        sales: product.quantity
      }));
      setProductSalesData(formattedProducts);
      
      // Load recent transactions
      const transactions = await getRecentTransactions(5);
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error loading sales data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de ventas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                  {date ? format(date, 'PPP', { locale: es }) : <span>Seleccionar fecha</span>}
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
            <Select defaultValue="daily" onValueChange={(val) => setPeriod(val as any)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diario</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download size={16} /> Exportar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
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
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Sales;
