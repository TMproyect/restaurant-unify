
import React, { useEffect, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  getSalesByCategory, 
  getSalesByHour,
  getSalesByMonth,
  getSavedReports,
  type CategorySalesData,
  type HourlySalesData,
  type MonthlySalesData,
  type SavedReport
} from '@/services/reports';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileClock, FileBarChart, FileSpreadsheet, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

const Reports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');
  const [categorySales, setCategorySales] = useState<CategorySalesData[]>([]);
  const [hourlySales, setHourlySales] = useState<HourlySalesData[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    console.log('🔄 [Reports] Component mounted');
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      
      // Load all report data in parallel
      const [categoryData, hourlyData, monthlyData, reports] = await Promise.all([
        getSalesByCategory(30),
        getSalesByHour(30),
        getSalesByMonth(6),
        getSavedReports()
      ]);
      
      setCategorySales(categoryData);
      setHourlySales(hourlyData);
      setMonthlySales(monthlyData);
      setSavedReports(reports);
      
      console.log('🔄 [Reports] Data loaded successfully');
    } catch (error) {
      console.error('❌ [Reports] Error loading data:', error);
      toast.error('Error al cargar los reportes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = (format: 'PDF' | 'Excel') => {
    const reportTypes = {
      monthly: 'Ventas Mensuales',
      category: 'Ventas por Categoría',
      hourly: 'Ventas por Hora'
    };
    
    const reportName = reportTypes[activeTab as keyof typeof reportTypes];
    toast.success(`Exportando ${reportName}`, {
      description: `El reporte se está generando en formato ${format}`
    });
    
    // This would normally call a service to generate the report
    setTimeout(() => {
      toast.success(`Reporte ${reportName} generado`, {
        description: `El archivo ha sido guardado en formato ${format}`
      });
    }, 2000);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Reportes</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => handleExportReport('PDF')}
            >
              <FileText size={16} />
              PDF
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => handleExportReport('Excel')}
            >
              <FileSpreadsheet size={16} />
              Excel
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ventas del Mes</CardTitle>
                  <CardDescription>Resumen de ventas por categoría de productos</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {categorySales.length > 0 ? (
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
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {categorySales.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`$${value.toFixed(2)}`, 'Ventas']}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-lg font-medium">No hay datos disponibles</p>
                      <p className="text-muted-foreground">Intente seleccionar otro período</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Productos Populares</CardTitle>
                  <CardDescription>Los productos con mayor número de ventas</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {categorySales.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categorySales.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip 
                          formatter={(value: any) => [`$${value.toFixed(2)}`, 'Ventas']}
                        />
                        <Bar dataKey="value" fill="#8884d8">
                          {categorySales.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-lg font-medium">No hay datos disponibles</p>
                      <p className="text-muted-foreground">Intente seleccionar otro período</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Estadísticas de Ventas</CardTitle>
                <CardDescription>Análisis detallado del comportamiento de ventas</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs 
                  defaultValue="monthly" 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="space-y-4"
                >
                  <TabsList className="grid grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="monthly" className="gap-2">
                      <FileBarChart className="h-4 w-4" /> Mensual
                    </TabsTrigger>
                    <TabsTrigger value="category" className="gap-2">
                      <FileText className="h-4 w-4" /> Por Categoría
                    </TabsTrigger>
                    <TabsTrigger value="hourly" className="gap-2">
                      <FileClock className="h-4 w-4" /> Por Hora
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="monthly" className="h-[400px]">
                    {monthlySales.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlySales}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [`$${value.toFixed(2)}`, 'Ventas']}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="sales" 
                            stroke="#8884d8" 
                            activeDot={{ r: 8 }} 
                            name="Ventas Mensuales"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-lg font-medium">No hay datos disponibles</p>
                        <p className="text-muted-foreground">Intente seleccionar otro período</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="category" className="h-[400px]">
                    {categorySales.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categorySales}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [`$${value.toFixed(2)}`, 'Ventas']}
                          />
                          <Legend />
                          <Bar dataKey="value" fill="#8884d8" name="Ventas por Categoría">
                            {categorySales.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-lg font-medium">No hay datos disponibles</p>
                        <p className="text-muted-foreground">Intente seleccionar otro período</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="hourly" className="h-[400px]">
                    {hourlySales.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={hourlySales}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [`$${value.toFixed(2)}`, 'Ventas']}
                          />
                          <Legend />
                          <Bar dataKey="sales" fill="#82ca9d" name="Ventas por Hora" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-lg font-medium">No hay datos disponibles</p>
                        <p className="text-muted-foreground">Intente seleccionar otro período</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {savedReports.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Reportes Guardados</CardTitle>
                  <CardDescription>Reportes generados anteriormente</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {savedReports.map((report) => (
                      <div key={report.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          {report.type === 'PDF' ? (
                            <FileText className="h-5 w-5 text-red-500" />
                          ) : (
                            <FileSpreadsheet className="h-5 w-5 text-green-500" />
                          )}
                          <div>
                            <p className="font-medium">{report.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(report.date), 'PPP', { locale: es })}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
