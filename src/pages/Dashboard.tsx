
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import DashboardCard from '@/components/dashboard/DashboardCard';
import OrdersList from '@/components/dashboard/OrdersList';
import AlertsBanner from '@/components/dashboard/AlertsBanner';
import { Avatar, AvatarGroup } from '@/components/ui/Avatars';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  ClipboardList,
  MessagesSquare
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';

// Sample staff data
const STAFF_MEMBERS = [
  { name: 'Carlos Ramos', role: 'waiter' as const },
  { name: 'Maria Lopez', role: 'kitchen' as const },
  { name: 'Juan Perez', role: 'delivery' as const },
  { name: 'Ana Garcia', role: 'waiter' as const },
  { name: 'Pedro Rodriguez', role: 'kitchen' as const },
  { name: 'Sofia Diaz', role: 'waiter' as const },
];

// Sample tables data
const TABLES_DATA = [
  { id: '1', status: 'occupied', time: '40 min', server: 'Carlos' },
  { id: '2', status: 'occupied', time: '15 min', server: 'Sofia' },
  { id: '3', status: 'occupied', time: '1h 20m', server: 'Carlos' },
  { id: '4', status: 'available', time: '', server: '' },
  { id: '5', status: 'available', time: '', server: '' },
  { id: '6', status: 'reserved', time: '8:00 PM', server: 'Ana' },
];

// Role-specific dashboards
const Dashboard = () => {
  const { user } = useAuth();
  
  // State for loading simulation
  const [loading, setLoading] = useState(false);
  
  // Generate role-specific dashboard
  const renderRoleDashboard = () => {
    switch (user?.role) {
      case 'waiter':
        return <WaiterDashboard />;
      case 'kitchen':
        return <KitchenDashboard />;
      case 'delivery':
        return <DeliveryDashboard />;
      case 'manager':
      case 'admin':
      default:
        return <AdminDashboard />;
    }
  };
  
  return (
    <Layout>
      {renderRoleDashboard()}
    </Layout>
  );
};

// Dashboard for Admin/Manager
const AdminDashboard = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold">Panel de Control</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Sales Summary Card */}
        <DashboardCard 
          title="Resumen de Ventas" 
          className="md:col-span-2"
          footer={
            <div className="text-sm text-right">
              <a href="#" className="text-primary hover:underline">Ver detalles</a>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ventas Hoy</p>
              <p className="text-xl md:text-2xl font-semibold mt-1">$1,284.50</p>
              <p className="text-xs text-green-600 mt-1">+12.5% vs ayer</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Órdenes</p>
              <p className="text-xl md:text-2xl font-semibold mt-1">24</p>
              <p className="text-xs text-green-600 mt-1">+4 vs ayer</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ticket Promedio</p>
              <p className="text-xl md:text-2xl font-semibold mt-1">$53.52</p>
              <p className="text-xs text-green-600 mt-1">+$2.30 vs ayer</p>
            </div>
          </div>
        </DashboardCard>
        
        {/* Staff Card */}
        <DashboardCard title="Personal Activo">
          <div className="space-y-4">
            <AvatarGroup users={STAFF_MEMBERS} />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Meseros</p>
                <p className="font-medium">3</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cocina</p>
                <p className="font-medium">2</p>
              </div>
              <div>
                <p className="text-muted-foreground">Delivery</p>
                <p className="font-medium">1</p>
              </div>
              <div>
                <p className="text-muted-foreground">Admin</p>
                <p className="font-medium">1</p>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
      
      {/* Alerts */}
      <div className="py-2">
        <h2 className="text-base md:text-lg font-medium mb-2 md:mb-3">Alertas Importantes</h2>
        <AlertsBanner />
      </div>
      
      {/* Orders */}
      <div>
        <h2 className="text-base md:text-lg font-medium mb-2 md:mb-3">Órdenes Recientes</h2>
        <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm overflow-hidden">
          <OrdersList limit={isMobile ? 3 : 5} />
          <div className="p-3 border-t border-border text-center">
            <a href="#" className="text-primary hover:underline text-sm">
              Ver todas las órdenes
            </a>
          </div>
        </div>
      </div>
      
      {/* Tables Grid */}
      <div>
        <h2 className="text-base md:text-lg font-medium mb-2 md:mb-3">Estado de Mesas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {TABLES_DATA.map((table) => (
            <div 
              key={table.id}
              className={`border rounded-lg p-3 md:p-4 text-center transition-all ${
                table.status === 'occupied' 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900' 
                  : table.status === 'reserved' 
                  ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-900'
                  : 'bg-white border-border dark:bg-gray-900'
              }`}
            >
              <h3 className="font-medium text-sm md:text-base">Mesa {table.id}</h3>
              <p className={`text-xs md:text-sm mt-1 ${
                table.status === 'occupied' ? 'text-blue-700 dark:text-blue-300' :
                table.status === 'reserved' ? 'text-purple-700 dark:text-purple-300' :
                'text-green-700 dark:text-green-300'
              }`}>
                {table.status === 'occupied' ? 'Ocupada' : 
                 table.status === 'reserved' ? 'Reservada' : 'Disponible'}
              </p>
              {table.time && <p className="text-xs mt-1">{table.time}</p>}
              {table.server && <p className="text-xs mt-1">Mesero: {table.server}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Dashboard for Waiters
const WaiterDashboard = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Estados para los diálogos
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [openBillDialog, setOpenBillDialog] = useState(false);
  const [openChatDialog, setOpenChatDialog] = useState(false);
  const [openSOSDialog, setOpenSOSDialog] = useState(false);
  
  // Estado para mensajes de chat
  const [chatMessages, setMessages] = useState([
    { sender: 'Cocina', text: 'Necesitamos más detalles para la orden #35', time: '09:45' },
    { sender: 'Cocina', text: 'Se terminaron las papas fritas, ofrecer sustituto', time: '10:10' },
    { sender: 'Cocina', text: 'Pedido de mesa 3 estará listo en 5 minutos', time: '10:30' },
  ]);
  
  // Estado para la nueva orden
  const [newOrder, setNewOrder] = useState({
    tableId: '',
    items: []
  });
  
  // Estado para el mensaje SOS
  const [sosMessage, setSOSMessage] = useState('');
  
  // Estado para el mensaje de chat
  const [newChatMessage, setNewChatMessage] = useState('');
  
  // Función para enviar mensaje de chat
  const sendChatMessage = () => {
    if (newChatMessage.trim() === '') return;
    
    const newMsg = {
      sender: 'Carlos',
      text: newChatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...chatMessages, newMsg]);
    setNewChatMessage('');
    toast({
      title: "Mensaje enviado",
      description: "Tu mensaje ha sido enviado a cocina",
    });
  };
  
  // Función para enviar SOS
  const sendSOS = () => {
    if (sosMessage.trim() === '') return;
    
    toast({
      title: "Ayuda solicitada",
      description: "Un gerente se acercará pronto",
      variant: "destructive"
    });
    
    setSOSMessage('');
    setOpenSOSDialog(false);
  };
  
  // Función para crear una nueva orden
  const createNewOrder = () => {
    if (newOrder.tableId === '') return;
    
    toast({
      title: "Orden creada",
      description: `Orden creada para Mesa ${newOrder.tableId}`,
    });
    
    setNewOrder({ tableId: '', items: [] });
    setOpenOrderDialog(false);
  };
  
  // Función para generar cuenta
  const generateBill = (tableId) => {
    toast({
      title: "Cuenta generada",
      description: `La cuenta para Mesa ${tableId} está lista`,
    });
    
    setOpenBillDialog(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold">Mi Trabajo</h1>
      
      {/* Acciones Rápidas - Movidas al inicio */}
      <div>
        <h2 className="text-base md:text-lg font-medium mb-2 md:mb-3">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Botón Tomar Orden */}
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center justify-center h-24 bg-white dark:bg-gray-900 border border-border rounded-lg text-center hover:bg-muted/50 transition-colors w-full">
                  <ClipboardList className="h-6 w-6 mb-2" />
                  <div className="text-base font-medium">Tomar Orden</div>
                  <p className="text-xs text-muted-foreground mt-1">Crear nueva orden</p>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Tomar Nueva Orden</DrawerTitle>
                  <DrawerDescription>Selecciona una mesa y agrega los items</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mesa</label>
                    <select 
                      className="w-full p-2 border border-border rounded-md"
                      value={newOrder.tableId}
                      onChange={(e) => setNewOrder({...newOrder, tableId: e.target.value})}
                    >
                      <option value="">Seleccionar Mesa</option>
                      {TABLES_DATA
                        .filter(table => table.status === 'available' || table.server === 'Carlos')
                        .map(table => (
                          <option key={table.id} value={table.id}>Mesa {table.id}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-sm">Esta funcionalidad permite tomar órdenes a los clientes.</p>
                    <p className="text-sm text-muted-foreground mt-1">En una implementación completa, aquí podrías ver el menú y agregar items a la orden.</p>
                  </div>
                </div>
                <DrawerFooter>
                  <Button onClick={createNewOrder} disabled={!newOrder.tableId}>Crear Orden</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={openOrderDialog} onOpenChange={setOpenOrderDialog}>
              <Button 
                variant="outline" 
                onClick={() => setOpenOrderDialog(true)}
                className="flex flex-col items-center justify-center h-24 bg-white dark:bg-gray-900 border border-border rounded-lg text-center hover:bg-muted/50 transition-colors w-full"
              >
                <ClipboardList className="h-6 w-6 mb-2" />
                <div className="text-base font-medium">Tomar Orden</div>
                <p className="text-xs text-muted-foreground mt-1">Crear nueva orden</p>
              </Button>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Tomar Nueva Orden</DialogTitle>
                  <DialogDescription>Selecciona una mesa y agrega los items</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mesa</label>
                    <select 
                      className="w-full p-2 border border-border rounded-md"
                      value={newOrder.tableId}
                      onChange={(e) => setNewOrder({...newOrder, tableId: e.target.value})}
                    >
                      <option value="">Seleccionar Mesa</option>
                      {TABLES_DATA
                        .filter(table => table.status === 'available' || table.server === 'Carlos')
                        .map(table => (
                          <option key={table.id} value={table.id}>Mesa {table.id}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-sm">Esta funcionalidad permite tomar órdenes a los clientes.</p>
                    <p className="text-sm text-muted-foreground mt-1">En una implementación completa, aquí podrías ver el menú y agregar items a la orden.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createNewOrder} disabled={!newOrder.tableId}>Crear Orden</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Botón Generar Cuenta */}
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center justify-center h-24 bg-white dark:bg-gray-900 border border-border rounded-lg text-center hover:bg-muted/50 transition-colors w-full">
                  <FileText className="h-6 w-6 mb-2" />
                  <div className="text-base font-medium">Generar Cuenta</div>
                  <p className="text-xs text-muted-foreground mt-1">Para mesa actual</p>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Generar Cuenta</DrawerTitle>
                  <DrawerDescription>Selecciona una mesa para generar su cuenta</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {TABLES_DATA
                      .filter(table => table.status === 'occupied' && table.server === 'Carlos')
                      .map(table => (
                        <Button 
                          key={table.id} 
                          variant="outline"
                          onClick={() => generateBill(table.id)}
                          className="h-16 justify-start flex-col items-start p-3"
                        >
                          <div className="font-medium">Mesa {table.id}</div>
                          <div className="text-xs text-muted-foreground">{table.time} de ocupación</div>
                        </Button>
                    ))}
                  </div>
                </div>
                <DrawerFooter>
                  <Button onClick={() => setOpenBillDialog(false)}>Cancelar</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={openBillDialog} onOpenChange={setOpenBillDialog}>
              <Button 
                variant="outline" 
                onClick={() => setOpenBillDialog(true)}
                className="flex flex-col items-center justify-center h-24 bg-white dark:bg-gray-900 border border-border rounded-lg text-center hover:bg-muted/50 transition-colors w-full"
              >
                <FileText className="h-6 w-6 mb-2" />
                <div className="text-base font-medium">Generar Cuenta</div>
                <p className="text-xs text-muted-foreground mt-1">Para mesa actual</p>
              </Button>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Generar Cuenta</DialogTitle>
                  <DialogDescription>Selecciona una mesa para generar su cuenta</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="grid grid-cols-2 gap-3">
                    {TABLES_DATA
                      .filter(table => table.status === 'occupied' && table.server === 'Carlos')
                      .map(table => (
                        <Button 
                          key={table.id} 
                          variant="outline"
                          onClick={() => generateBill(table.id)}
                          className="h-16 justify-start flex-col items-start p-3"
                        >
                          <div className="font-medium">Mesa {table.id}</div>
                          <div className="text-xs text-muted-foreground">{table.time} de ocupación</div>
                        </Button>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setOpenBillDialog(false)}>Cancelar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Botón Chat Cocina */}
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center justify-center h-24 bg-white dark:bg-gray-900 border border-border rounded-lg text-center hover:bg-muted/50 transition-colors w-full">
                  <MessagesSquare className="h-6 w-6 mb-2" />
                  <div className="text-base font-medium">Chat Cocina</div>
                  <p className="text-xs text-muted-foreground mt-1">3 mensajes nuevos</p>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[90vh]">
                <DrawerHeader>
                  <DrawerTitle>Chat con Cocina</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <div className="border border-border rounded-lg h-[300px] mb-4 overflow-y-auto p-3 space-y-3">
                    {chatMessages.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col p-2 rounded-lg ${
                          msg.sender === 'Carlos' 
                            ? 'bg-primary/10 ml-8' 
                            : 'bg-muted mr-8'
                        }`}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium">{msg.sender}</span>
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Escribe un mensaje..." 
                      className="flex-1 p-2 border border-border rounded-md"
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <Button onClick={sendChatMessage}>Enviar</Button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={openChatDialog} onOpenChange={setOpenChatDialog}>
              <Button 
                variant="outline" 
                onClick={() => setOpenChatDialog(true)}
                className="flex flex-col items-center justify-center h-24 bg-white dark:bg-gray-900 border border-border rounded-lg text-center hover:bg-muted/50 transition-colors w-full"
              >
                <MessagesSquare className="h-6 w-6 mb-2" />
                <div className="text-base font-medium">Chat Cocina</div>
                <p className="text-xs text-muted-foreground mt-1">3 mensajes nuevos</p>
              </Button>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Chat con Cocina</DialogTitle>
                </DialogHeader>
                <div className="border border-border rounded-lg h-[300px] mb-4 overflow-y-auto p-3 space-y-3">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col p-2 rounded-lg ${
                        msg.sender === 'Carlos' 
                          ? 'bg-primary/10 ml-8' 
                          : 'bg-muted mr-8'
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium">{msg.sender}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Escribe un mensaje..." 
                    className="flex-1 p-2 border border-border rounded-md"
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <Button onClick={sendChatMessage}>Enviar</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Botón SOS Manager */}
          {isMobile ? (
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex flex-col items-center justify-center h-24 bg-white dark:bg-gray-900 border border-border rounded-lg text-center hover:bg-muted/50 transition-colors w-full">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  <div className="text-base font-medium">SOS Manager</div>
                  <p className="text-xs text-muted-foreground mt-1">Solicitar ayuda</p>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Solicitar ayuda del Gerente</DrawerTitle>
                  <DrawerDescription>Describe brevemente la situación</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <textarea 
                    placeholder="Ej: Necesito ayuda con un cliente difícil en la mesa 3" 
                    className="w-full h-32 p-2 border border-border rounded-md resize-none"
                    value={sosMessage}
                    onChange={(e) => setSOSMessage(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Esta alerta se enviará a todos los gerentes disponibles.</p>
                </div>
                <DrawerFooter>
                  <Button 
                    onClick={sendSOS} 
                    disabled={sosMessage.trim() === ''}
                    variant="destructive"
                  >
                    Enviar SOS
                  </Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={openSOSDialog} onOpenChange={setOpenSOSDialog}>
              <Button 
                variant="outline" 
                onClick={() => setOpenSOSDialog(true)}
                className="flex flex-col items-center justify-center h-24 bg-white dark:bg-gray-900 border border-border rounded-lg text-center hover:bg-muted/50 transition-colors w-full"
              >
                <AlertTriangle className="h-6 w-6 mb-2" />
                <div className="text-base font-medium">SOS Manager</div>
                <p className="text-xs text-muted-foreground mt-1">Solicitar ayuda</p>
              </Button>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Solicitar ayuda del Gerente</DialogTitle>
                  <DialogDescription>Describe brevemente la situación</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <textarea 
                    placeholder="Ej: Necesito ayuda con un cliente difícil en la mesa 3" 
                    className="w-full h-32 p-2 border border-border rounded-md resize-none"
                    value={sosMessage}
                    onChange={(e) => setSOSMessage(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Esta alerta se enviará a todos los gerentes disponibles.</p>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={sendSOS} 
                    disabled={sosMessage.trim() === ''}
                    variant="destructive"
                  >
                    Enviar SOS
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Tables Grid */}
      <div>
        <h2 className="text-base md:text-lg font-medium mb-2 md:mb-3">Mis Mesas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {TABLES_DATA.filter(t => t.server === 'Carlos' || t.status === 'available').map((table) => (
            <div 
              key={table.id}
              className={`border rounded-lg p-3 md:p-4 text-center transition-all ${
                table.status === 'occupied' 
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900' 
                  : table.status === 'reserved' 
                  ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-900'
                  : 'bg-white border-border dark:bg-gray-900'
              }`}
            >
              <h3 className="font-medium text-sm md:text-base">Mesa {table.id}</h3>
              <p className={`text-xs md:text-sm mt-1 ${
                table.status === 'occupied' ? 'text-blue-700 dark:text-blue-300' :
                table.status === 'reserved' ? 'text-purple-700 dark:text-purple-300' :
                'text-green-700 dark:text-green-300'
              }`}>
                {table.status === 'occupied' ? 'Ocupada' : 
                 table.status === 'reserved' ? 'Reservada' : 'Disponible'}
              </p>
              {table.time && <p className="text-xs mt-1">{table.time}</p>}
              {table.server && <p className="text-xs mt-1">Mesero: {table.server}</p>}
              <div className="mt-2">
                <button 
                  className="w-full px-3 py-1 text-xs md:text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    if (table.status === 'occupied') {
                      setOpenBillDialog(true);
                    } else {
                      setNewOrder({...newOrder, tableId: table.id});
                      setOpenOrderDialog(true);
                    }
                  }}
                >
                  {table.status === 'occupied' ? 'Ver orden' : 'Tomar orden'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* My Orders */}
      <div>
        <h2 className="text-base md:text-lg font-medium mb-2 md:mb-3">Mis Órdenes</h2>
        <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm overflow-hidden">
          <OrdersList limit={5} filter="table" />
        </div>
      </div>
    </div>
  );
};

// Dashboard for Kitchen Staff
const KitchenDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cocina</h1>
      
      {/* Orders by Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Pendientes (3)">
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex justify-between">
                <h4 className="font-medium">Orden #45</h4>
                <span className="text-sm text-muted-foreground">10:30 AM</span>
              </div>
              <p className="text-sm mt-1">Mesa 3 - Carlos</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <ul className="list-disc list-inside">
                  <li>2x Hamburguesa Clásica</li>
                  <li>1x Ensalada César</li>
                  <li>1x Papas Fritas (extra crujientes)</li>
                </ul>
              </div>
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition-colors">
                  Iniciar Preparación
                </button>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex justify-between">
                <h4 className="font-medium">Orden #46</h4>
                <span className="text-sm text-muted-foreground">10:40 AM</span>
              </div>
              <p className="text-sm mt-1">Mesa 5 - Sofia</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <ul className="list-disc list-inside">
                  <li>1x Pasta Alfredo</li>
                  <li>1x Sopa del Día</li>
                </ul>
              </div>
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition-colors">
                  Iniciar Preparación
                </button>
              </div>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard title="En Preparación (1)">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex justify-between">
                <h4 className="font-medium">Orden #47</h4>
                <span className="text-sm text-muted-foreground">10:25 AM</span>
              </div>
              <p className="text-sm mt-1">Delivery - Juan</p>
              <div className="mt-2 text-sm text-muted-foreground">
                <ul className="list-disc list-inside">
                  <li>1x Pizza Margherita</li>
                  <li>1x Lasaña</li>
                  <li>1x Tiramisú</li>
                </ul>
              </div>
              <div className="mt-3 flex space-x-2">
                <button className="flex-1 px-3 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors">
                  Marcar como Listo
                </button>
              </div>
            </div>
          </div>
        </DashboardCard>
        
        <DashboardCard title="Inventario Bajo">
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-300">Tomates</h4>
              <p className="text-sm mt-1">Quedan 2kg (Mínimo: 5kg)</p>
              <div className="mt-2">
                <button className="w-full px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors">
                  Solicitar más
                </button>
              </div>
            </div>
            
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Queso Mozzarella</h4>
              <p className="text-sm mt-1">Quedan 1.5kg (Mínimo: 3kg)</p>
              <div className="mt-2">
                <button className="w-full px-3 py-1.5 text-sm rounded-md bg-yellow-600 text-white hover:bg-yellow-700 transition-colors">
                  Solicitar más
                </button>
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>
      
      {/* All Orders */}
      <div>
        <h2 className="text-lg font-medium mb-3">Todas las Órdenes</h2>
        <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm overflow-hidden">
          <OrdersList limit={10} />
        </div>
      </div>
    </div>
  );
};

// Dashboard for Delivery Staff
const DeliveryDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Delivery</h1>
      
      {/* Ready for Delivery */}
      <div>
        <h2 className="text-lg font-medium mb-3">Listos para Entregar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">Orden #47</h3>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded text-xs font-medium">
                Listo
              </span>
            </div>
            <p className="text-sm mt-1">Juan Perez</p>
            <p className="text-sm mt-1">Av. Libertador 1234, Apto 5B</p>
            <p className="text-sm font-medium mt-2">Total: $35.20</p>
            <div className="mt-3 flex space-x-2">
              <button className="flex-1 px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition-colors">
                Iniciar Entrega
              </button>
              <button className="px-3 py-1.5 text-sm rounded-md bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                Ver Mapa
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* In Progress */}
      <div>
        <h2 className="text-lg font-medium mb-3">En Preparación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">Orden #48</h3>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                Preparando
              </span>
            </div>
            <p className="text-sm mt-1">Maria Rodriguez</p>
            <p className="text-sm mt-1">Calle San Martín 567</p>
            <p className="text-sm font-medium mt-2">Total: $42.75</p>
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full w-2/3"></div>
              </div>
              <p className="text-xs text-right mt-1 text-muted-foreground">Tiempo estimado: 15 min</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delivery History */}
      <div>
        <h2 className="text-lg font-medium mb-3">Historial de Entregas</h2>
        <div className="bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                  Orden
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                  Cliente
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                  Dirección
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                  Total
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-foreground">
                  Hora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                  #44
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  Sofia Reyes
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  Av. Florida 890
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                  $68.90
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                  10:15 AM
                </td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                  #41
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  Pedro Martinez
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  Calle Belgrano 123
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">
                  $42.30
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                  09:30 AM
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Stats */}
      <div>
        <h2 className="text-lg font-medium mb-3">Estadísticas del Día</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-900 border border-border rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Entregas Completadas</p>
            <p className="text-2xl font-semibold mt-1">2</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 border border-border rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Distancia Recorrida</p>
            <p className="text-2xl font-semibold mt-1">8.5 km</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-900 border border-border rounded-lg text-center">
            <p className="text-muted-foreground text-sm">Propinas</p>
            <p className="text-2xl font-semibold mt-1">$12.50</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
