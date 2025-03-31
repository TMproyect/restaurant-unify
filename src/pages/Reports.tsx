
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Download, FileText, Bookmark, Clock, Loader2 } from 'lucide-react';
import { 
  getSalesByCategory,
  getSalesByHour,
  getSalesByMonth,
  getSavedReports,
  exportReport,
  type CategorySalesData,
  type HourlySalesData,
  type MonthlySalesData,
  type SavedReport
} from '@/services/reportService';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF5733', '#C70039', '#900C3F', '#581845'];

const Reports = () => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [categorySales, setCategorySales] = useState<CategorySalesData[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySalesData[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [period]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Convert period to days for API calls
      const periodDays = period === 'day' ? 1 : 
                         period === 'week' ? 7 : 
                         period === 'month' ? 30 : 
                         period === 'quarter' ? 90 : 365;
      
      // Load sales by category
      const categoryData = await getSalesByCategory(periodDays);
      setCategorySales(categoryData);
      
      // Load sales by hour
      const hourlyData = await getSalesByHour(periodDays);
      setHourlySales(hourlyData);
      
      // Load monthly sales (always 6 months)
      const monthlyData = await getSalesByMonth(6);
      setMonthlySales(monthlyData);
      
      // Load saved reports
      const reports = await getSavedReports();
      setSavedReports(reports);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos para los reportes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (type: string) => {
    try {
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const downloadUrl = await exportReport(
        type,
        'Excel', 
        {
          start: lastMonth.toISOString().split('T')[0],
          end: now.toISOString().split('T')[0]
        }
      );
      
      toast({
        title: "Reporte generado",
        description: "El reporte se ha generado correctamente"
      });
      
      // In a real app, we would trigger the download here
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Reportes</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select defaultValue="month" onValueChange={(val) => setPeriod(val as any)}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Día</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mes</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download size={16} /> Exportar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="sales">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Ventas</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
            <TabsTrigger value="staff">Personal</TabsTrigger>
            <TabsTrigger value="saved">Guardados</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <TabsContent value="sales" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ventas por Categoría</CardTitle>
                      <CardDescription>
                        Distribución de ventas por categoría de producto 
                        ({period === 'day' ? 'hoy' : 
                          period === 'week' ? 'últimos 7 días' : 
                          period === 'month' ? 'último mes' : 
                          period === 'quarter' ? 'último trimestre' : 'último año'})
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categorySales}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {categorySales.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ventas por Hora</CardTitle>
                      <CardDescription>
                        Distribución de ventas a lo largo del día
                        ({period === 'day' ? 'hoy' : 
                          period === 'week' ? 'últimos 7 días' : 
                          period === 'month' ? 'último mes' : 
                          period === 'quarter' ? 'último trimestre' : 'último año'})
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={hourlySales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="sales" fill="#8884d8" name="Ventas ($)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Tendencia de Ventas</CardTitle>
                    <CardDescription>Ventas mensuales durante los últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlySales}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                          <Legend />
                          <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} name="Ventas ($)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reportes de Inventario</CardTitle>
                    <CardDescription>Seleccione un tipo de reporte de inventario para generar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('inventory_valuation')}
                      >
                        <FileText size={24} />
                        <span>Valoración de Inventario</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('inventory_movements')}
                      >
                        <FileText size={24} />
                        <span>Movimientos de Stock</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('low_stock')}
                      >
                        <FileText size={24} />
                        <span>Productos Bajo Mínimo</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('inventory_turnover')}
                      >
                        <FileText size={24} />
                        <span>Rotación de Inventario</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('expired_products')}
                      >
                        <FileText size={24} />
                        <span>Productos Caducados</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('waste')}
                      >
                        <FileText size={24} />
                        <span>Mermas</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="staff" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reportes de Personal</CardTitle>
                    <CardDescription>Seleccione un tipo de reporte de personal para generar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('staff_performance')}
                      >
                        <FileText size={24} />
                        <span>Rendimiento de Ventas</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('staff_hours')}
                      >
                        <FileText size={24} />
                        <span>Horas Trabajadas</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('staff_tips')}
                      >
                        <FileText size={24} />
                        <span>Propinas Recibidas</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('preparation_time')}
                      >
                        <FileText size={24} />
                        <span>Tiempo de Preparación</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('staff_attendance')}
                      >
                        <FileText size={24} />
                        <span>Asistencia</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                        onClick={() => handleExportReport('staff_evaluation')}
                      >
                        <FileText size={24} />
                        <span>Evaluación de Desempeño</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="saved" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reportes Guardados</CardTitle>
                    <CardDescription>Acceda a los reportes que ha guardado anteriormente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {savedReports.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground">No hay reportes guardados</p>
                    ) : (
                      <div className="space-y-2">
                        {savedReports.map(report => (
                          <div key={report.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-secondary/50 cursor-pointer transition-colors">
                            <div className="flex items-center">
                              <Bookmark size={20} className="mr-3 text-primary" />
                              <div>
                                <p className="font-medium">{report.name}</p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Clock size={14} className="mr-1" />
                                  <span>{report.date}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-secondary px-2 py-1 rounded">{report.type}</span>
                              <Button size="sm" variant="ghost">
                                <Download size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
