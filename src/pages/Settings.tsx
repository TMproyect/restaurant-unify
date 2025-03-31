import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Building, CreditCard, Globe, Bell, Shield, Save, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin' || user?.role === 'propietario';
  
  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Configuración</h1>
        </div>

        <Tabs defaultValue="general">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64">
              <TabsList className="flex flex-col w-full h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="general" 
                  className="justify-start px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:shadow-none text-left"
                >
                  <Building size={16} className="mr-2" /> General
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="justify-start px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:shadow-none text-left"
                >
                  <CreditCard size={16} className="mr-2" /> Pagos
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="justify-start px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:shadow-none text-left"
                >
                  <Bell size={16} className="mr-2" /> Notificaciones
                </TabsTrigger>
                <TabsTrigger 
                  value="website" 
                  className="justify-start px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:shadow-none text-left"
                >
                  <Globe size={16} className="mr-2" /> Sitio Web
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="justify-start px-4 py-2 h-10 data-[state=active]:bg-secondary data-[state=active]:shadow-none text-left"
                >
                  <Shield size={16} className="mr-2" /> Seguridad
                </TabsTrigger>
                
                {isAdmin && (
                  <Link to="/roles-and-permissions" className="text-left">
                    <div className="flex items-center px-4 py-2 h-10 rounded-md text-sm font-medium transition-colors hover:bg-secondary hover:text-secondary-foreground">
                      <Users size={16} className="mr-2" /> Roles y Permisos
                    </div>
                  </Link>
                )}
              </TabsList>
            </div>

            <div className="flex-1">
              <TabsContent value="general" className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Información del Restaurante</CardTitle>
                    <CardDescription>
                      Actualice la información básica de su restaurante
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="restaurant-name">Nombre del Restaurante</Label>
                        <Input id="restaurant-name" defaultValue="La Buena Mesa" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax-id">Identificación Fiscal</Label>
                        <Input id="tax-id" defaultValue="B-12345678" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" defaultValue="Av. Principal 123" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">Ciudad</Label>
                        <Input id="city" defaultValue="Ciudad Ejemplo" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado/Provincia</Label>
                        <Input id="state" defaultValue="Provincia" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipcode">Código Postal</Label>
                        <Input id="zipcode" defaultValue="12345" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" defaultValue="+1234567890" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="info@labuenamese.com" />
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label htmlFor="schedule">Horario de Operación</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Días de Apertura</p>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="monday" defaultChecked />
                              <label htmlFor="monday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Lunes
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="tuesday" defaultChecked />
                              <label htmlFor="tuesday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Martes
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="wednesday" defaultChecked />
                              <label htmlFor="wednesday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Miércoles
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="thursday" defaultChecked />
                              <label htmlFor="thursday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Jueves
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="friday" defaultChecked />
                              <label htmlFor="friday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Viernes
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="saturday" defaultChecked />
                              <label htmlFor="saturday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Sábado
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="sunday" defaultChecked />
                              <label htmlFor="sunday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Domingo
                              </label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Horarios</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label htmlFor="opening-time">Apertura</Label>
                              <Input id="opening-time" type="time" defaultValue="12:00" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="closing-time">Cierre</Label>
                              <Input id="closing-time" type="time" defaultValue="23:00" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button className="gap-2">
                        <Save size={16} /> Guardar Cambios
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment" className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Pagos</CardTitle>
                    <CardDescription>
                      Configure los métodos de pago y opciones de facturación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Métodos de Pago Aceptados</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="credit-card" defaultChecked />
                          <label htmlFor="credit-card" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Tarjetas de Crédito/Débito
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="cash" defaultChecked />
                          <label htmlFor="cash" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Efectivo
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-payment" defaultChecked />
                          <label htmlFor="mobile-payment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Pagos Móviles
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="online-payment" defaultChecked />
                          <label htmlFor="online-payment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Pagos Online
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label>Impuestos</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tax-rate">Tasa de Impuesto (%)</Label>
                          <Input id="tax-rate" type="number" defaultValue="21" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tax-included">Precios con Impuestos Incluidos</Label>
                          <div className="flex items-center space-x-2">
                            <Switch id="tax-included" defaultChecked />
                            <Label htmlFor="tax-included">Mostrar precios con impuestos incluidos</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label>Propinas</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tip-options">Opciones de Propina (%)</Label>
                          <Input id="tip-options" defaultValue="5, 10, 15, 20" />
                          <p className="text-xs text-muted-foreground">Separe los valores con comas</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="automatic-tip">Propina Automática</Label>
                          <div className="flex items-center space-x-2">
                            <Switch id="automatic-tip" />
                            <Label htmlFor="automatic-tip">Aplicar propina automática para grupos grandes</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button className="gap-2">
                        <Save size={16} /> Guardar Cambios
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Notificaciones</CardTitle>
                    <CardDescription>
                      Personalice cómo y cuándo recibir notificaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Notificaciones en la Aplicación</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="new-order">Nuevas Órdenes</Label>
                            <p className="text-sm text-muted-foreground">
                              Recibir alertas cuando llegue una nueva orden
                            </p>
                          </div>
                          <Switch id="new-order" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="order-status">Cambios de Estado en Órdenes</Label>
                            <p className="text-sm text-muted-foreground">
                              Notificaciones cuando una orden cambie de estado
                            </p>
                          </div>
                          <Switch id="order-status" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="inventory-alerts">Alertas de Inventario</Label>
                            <p className="text-sm text-muted-foreground">
                              Notificaciones cuando el inventario esté bajo mínimos
                            </p>
                          </div>
                          <Switch id="inventory-alerts" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="reservation-alerts">Reservas</Label>
                            <p className="text-sm text-muted-foreground">
                              Alertas para nuevas reservas y recordatorios
                            </p>
                          </div>
                          <Switch id="reservation-alerts" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label>Notificaciones por Email</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="daily-summary">Resumen Diario</Label>
                            <p className="text-sm text-muted-foreground">
                              Recibir un resumen diario de actividad
                            </p>
                          </div>
                          <Switch id="daily-summary" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="weekly-report">Informe Semanal</Label>
                            <p className="text-sm text-muted-foreground">
                              Recibir un informe detallado semanal
                            </p>
                          </div>
                          <Switch id="weekly-report" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="space-y-0.5">
                            <Label htmlFor="marketing-emails">Emails de Marketing</Label>
                            <p className="text-sm text-muted-foreground">
                              Recibir actualizaciones sobre nuevas funciones
                            </p>
                          </div>
                          <Switch id="marketing-emails" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button className="gap-2">
                        <Save size={16} /> Guardar Cambios
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="website" className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración del Sitio Web</CardTitle>
                    <CardDescription>
                      Personalice la información mostrada en su sitio web público
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant-description">Descripción del Restaurante</Label>
                      <textarea 
                        id="restaurant-description" 
                        className="w-full min-h-[100px] p-2 border rounded-md"
                        defaultValue="La Buena Mesa ofrece una experiencia culinaria única con ingredientes frescos y locales. Nuestro menú combina sabores tradicionales con toques modernos para satisfacer a todos los paladares."
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="website-url">URL del Sitio Web</Label>
                        <Input id="website-url" defaultValue="www.labuenamese.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reservation-link">Enlace de Reservaciones</Label>
                        <Input id="reservation-link" defaultValue="www.labuenamese.com/reservas" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Redes Sociales</Label>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="facebook" className="text-right">Facebook</Label>
                          <Input id="facebook" defaultValue="facebook.com/labuenamese" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="instagram" className="text-right">Instagram</Label>
                          <Input id="instagram" defaultValue="instagram.com/labuenamese" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="twitter" className="text-right">Twitter</Label>
                          <Input id="twitter" defaultValue="twitter.com/labuenamese" className="col-span-3" />
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label>Opciones de Menú Online</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="show-menu" defaultChecked />
                          <label htmlFor="show-menu" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Mostrar menú completo en el sitio web
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="show-prices" defaultChecked />
                          <label htmlFor="show-prices" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Mostrar precios en el menú online
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="online-ordering" defaultChecked />
                          <label htmlFor="online-ordering" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Habilitar pedidos online
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button className="gap-2">
                        <Save size={16} /> Guardar Cambios
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="w-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Seguridad</CardTitle>
                    <CardDescription>
                      Gestione la seguridad de su cuenta y la información del negocio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cambiar Contraseña</Label>
                      <div className="space-y-2">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Contraseña Actual</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nueva Contraseña</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                      </div>
                      <Button className="mt-2">Actualizar Contraseña</Button>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label>Verificación de Dos Factores</Label>
                      <div className="flex items-center justify-between py-2">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Autenticación de Dos Factores</p>
                          <p className="text-sm text-muted-foreground">
                            Añada una capa extra de seguridad a su cuenta
                          </p>
                        </div>
                        <Switch id="two-factor" />
                      </div>
                      <Button variant="outline" disabled>Configurar Autenticación de Dos Factores</Button>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label>Sesiones Activas</Label>
                      <div className="space-y-2">
                        <div className="flex flex-col p-3 border rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Este Dispositivo</p>
                              <p className="text-sm text-muted-foreground">Última actividad: Ahora</p>
                            </div>
                            <Button variant="outline" size="sm">Actual</Button>
                          </div>
                        </div>
                        <div className="flex flex-col p-3 border rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Tablet - iPad</p>
                              <p className="text-sm text-muted-foreground">Última actividad: Hace 2 horas</p>
                            </div>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">Cerrar Sesión</Button>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="text-red-500 hover:text-red-700 hover:border-red-500">Cerrar Todas las Otras Sesiones</Button>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-2">
                      <Label>Permisos y Roles</Label>
                      <p className="text-sm text-muted-foreground">
                        Gestione los permisos y roles de usuario desde la sección de Personal
                      </p>
                      <Button variant="outline">Ir a Configuración de Personal</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
