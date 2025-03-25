
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Download, FileText, Bookmark, Clock } from 'lucide-react';

// Datos de ejemplo para reportes
const salesByCategory = [
  { name: 'Platos Principales', value: 42 },
  { name: 'Postres', value: 18 },
  { name: 'Bebidas', value: 28 },
  { name: 'Entrantes', value: 12 },
];

const salesByHour = [
  { hour: '12 PM', sales: 450 },
  { hour: '1 PM', sales: 780 },
  { hour: '2 PM', sales: 650 },
  { hour: '3 PM', sales: 320 },
  { hour: '4 PM', sales: 240 },
  { hour: '5 PM', sales: 380 },
  { hour: '6 PM', sales: 720 },
  { hour: '7 PM', sales: 980 },
  { hour: '8 PM', sales: 1100 },
  { hour: '9 PM', sales: 850 },
  { hour: '10 PM', sales: 450 },
];

const monthlySales = [
  { month: 'Ene', sales: 21500 },
  { month: 'Feb', sales: 23200 },
  { month: 'Mar', sales: 26400 },
  { month: 'Abr', sales: 24800 },
  { month: 'May', sales: 28100 },
  { month: 'Jun', sales: 32000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const savedReports = [
  { id: 1, name: 'Ventas Mensuales 2023', date: '2023-12-01', type: 'Excel' },
  { id: 2, name: 'Análisis de Productos Q2', date: '2023-07-15', type: 'PDF' },
  { id: 3, name: 'Rendimiento de Personal', date: '2023-09-30', type: 'Excel' },
  { id: 4, name: 'Inventario Trimestral', date: '2023-10-01', type: 'PDF' },
];

const Reports = () => {
  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Reportes</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select defaultValue="month">
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
          
          <TabsContent value="sales" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Categoría</CardTitle>
                  <CardDescription>Distribución de ventas por categoría de producto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={salesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {salesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Hora</CardTitle>
                  <CardDescription>Distribución de ventas a lo largo del día</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesByHour}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
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
                      <Tooltip />
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
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
                    <FileText size={24} />
                    <span>Valoración de Inventario</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
                    <FileText size={24} />
                    <span>Movimientos de Stock</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
                    <FileText size={24} />
                    <span>Productos Bajo Mínimo</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
                    <FileText size={24} />
                    <span>Rotación de Inventario</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
                    <FileText size={24} />
                    <span>Productos Caducados</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
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
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
                    <FileText size={24} />
                    <span>Rendimiento de Ventas</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
                    <FileText size={24} />
                    <span>Horas Trabajadas</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
                    <FileText size={24} />
                    <span>Propinas Recibidas</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
                    <FileText size={24} />
                    <span>Tiempo de Preparación</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
                    <FileText size={24} />
                    <span>Asistencia</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center gap-2">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
