
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Search, Plus, MoreHorizontal, UserPlus, ChevronDown } from 'lucide-react';

// Datos de ejemplo para empleados
const staffMembers = [
  { 
    id: 1, 
    name: 'Ana López', 
    role: 'Mesero', 
    email: 'ana.lopez@example.com', 
    phone: '+1234567890', 
    status: 'active',
    avatar: '' 
  },
  { 
    id: 2, 
    name: 'Carlos Martínez', 
    role: 'Mesero', 
    email: 'carlos.martinez@example.com', 
    phone: '+1234567891', 
    status: 'active',
    avatar: '' 
  },
  { 
    id: 3, 
    name: 'Elena Sánchez', 
    role: 'Chef', 
    email: 'elena.sanchez@example.com', 
    phone: '+1234567892', 
    status: 'active',
    avatar: '' 
  },
  { 
    id: 4, 
    name: 'Miguel Pérez', 
    role: 'Repartidor', 
    email: 'miguel.perez@example.com', 
    phone: '+1234567893', 
    status: 'active',
    avatar: '' 
  },
  { 
    id: 5, 
    name: 'Laura Gómez', 
    role: 'Recepcionista', 
    email: 'laura.gomez@example.com', 
    phone: '+1234567894', 
    status: 'inactive',
    avatar: '' 
  },
  { 
    id: 6, 
    name: 'Javier Rodríguez', 
    role: 'Ayudante de Cocina', 
    email: 'javier.rodriguez@example.com', 
    phone: '+1234567895', 
    status: 'active',
    avatar: '' 
  },
  { 
    id: 7, 
    name: 'Carmen Torres', 
    role: 'Administrador', 
    email: 'carmen.torres@example.com', 
    phone: '+1234567896', 
    status: 'active',
    avatar: '' 
  },
];

// Datos de ejemplo para roles
const roles = [
  { id: 1, name: 'Administrador', permissions: 'Acceso completo', members: 1 },
  { id: 2, name: 'Gerente', permissions: 'Gestión de personal, finanzas', members: 0 },
  { id: 3, name: 'Chef', permissions: 'Cocina, inventario', members: 1 },
  { id: 4, name: 'Mesero', permissions: 'Órdenes, mesas', members: 2 },
  { id: 5, name: 'Recepcionista', permissions: 'Reservas, clientes', members: 1 },
  { id: 6, name: 'Repartidor', permissions: 'Entregas', members: 1 },
  { id: 7, name: 'Ayudante de Cocina', permissions: 'Cocina', members: 1 },
];

const Staff = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filtrar personal basado en la búsqueda
  const filteredStaff = staffMembers.filter(staff => 
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Personal</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button><UserPlus size={18} className="mr-2" /> Añadir Empleado</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Empleado</DialogTitle>
                <DialogDescription>
                  Complete la información para crear una nueva cuenta de empleado.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">Nombre Completo</Label>
                  <Input id="new-name" placeholder="Ej. Juan Pérez" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">Email</Label>
                  <Input id="new-email" type="email" placeholder="juan.perez@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-phone">Teléfono</Label>
                  <Input id="new-phone" placeholder="+1234567890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role">Rol</Label>
                  <Select>
                    <SelectTrigger id="new-role">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Crear Empleado</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="employees">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employees">Empleados</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees" className="mt-4">
            <Card>
              <CardHeader className="p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar por nombre o rol..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filtrar por Rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los Roles</SelectItem>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select defaultValue="active">
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Activos</SelectItem>
                        <SelectItem value="inactive">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Empleado</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map(staff => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={staff.avatar} />
                              <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{staff.name}</p>
                              <p className="text-sm text-muted-foreground">ID: {staff.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{staff.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{staff.email}</p>
                            <p className="text-muted-foreground">{staff.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {staff.status === 'active' ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Inactivo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Detalles del Empleado</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="flex flex-col items-center gap-2">
                                  <Avatar className="h-20 w-20">
                                    <AvatarImage src={staff.avatar} />
                                    <AvatarFallback className="text-xl">{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                  </Avatar>
                                  <h3 className="font-bold text-lg">{staff.name}</h3>
                                  <Badge variant="outline">{staff.role}</Badge>
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email</span>
                                    <span>{staff.email}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Teléfono</span>
                                    <span>{staff.phone}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Estado</span>
                                    <span>{staff.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                                  </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-2">
                                  <Label>Cambiar Rol</Label>
                                  <Select defaultValue={staff.role}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {roles.map(role => (
                                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                <Button className="w-full" variant="outline">Editar Detalles</Button>
                                {staff.status === 'active' ? (
                                  <Button className="w-full" variant="destructive">Desactivar Cuenta</Button>
                                ) : (
                                  <Button className="w-full" variant="default">Activar Cuenta</Button>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Roles y Permisos</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button><Plus size={18} className="mr-2" /> Crear Rol</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Rol</DialogTitle>
                        <DialogDescription>
                          Defina un nuevo rol con permisos específicos.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="role-name">Nombre del Rol</Label>
                          <Input id="role-name" placeholder="Ej. Supervisor" />
                        </div>
                        <div className="space-y-2">
                          <Label>Permisos</Label>
                          <div className="border rounded-md p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="perm-dashboard" className="rounded" />
                              <Label htmlFor="perm-dashboard">Dashboard</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="perm-orders" className="rounded" />
                              <Label htmlFor="perm-orders">Órdenes</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="perm-kitchen" className="rounded" />
                              <Label htmlFor="perm-kitchen">Cocina</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="perm-inventory" className="rounded" />
                              <Label htmlFor="perm-inventory">Inventario</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="perm-delivery" className="rounded" />
                              <Label htmlFor="perm-delivery">Entregas</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="perm-reports" className="rounded" />
                              <Label htmlFor="perm-reports">Reportes</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="perm-settings" className="rounded" />
                              <Label htmlFor="perm-settings">Configuración</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="perm-staff" className="rounded" />
                              <Label htmlFor="perm-staff">Personal</Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Crear Rol</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rol</TableHead>
                      <TableHead>Permisos</TableHead>
                      <TableHead>Miembros</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map(role => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.permissions}</TableCell>
                        <TableCell>{role.members}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-1">
                            Editar <ChevronDown size={14} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Staff;
