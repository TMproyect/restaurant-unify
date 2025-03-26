import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { Search, Plus, MoreHorizontal, UserPlus, ChevronDown, Upload, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { UserRole } from '@/contexts/auth/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

// Interface for user profile
interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatar?: string;
  created_at: string;
}

// Interface for roles
interface Role {
  id: number;
  name: string;
  permissions: string;
  members: number;
}

const Staff = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [staffMembers, setStaffMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('waiter');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, createUser, updateUserRole } = useAuth();
  
  // Roles data
  const roles: Role[] = [
    { id: 1, name: 'Administrador', permissions: 'Acceso completo', members: 0 },
    { id: 2, name: 'Gerente', permissions: 'Gestión de personal, finanzas', members: 0 },
    { id: 3, name: 'Cocina', permissions: 'Cocina, inventario', members: 0 },
    { id: 4, name: 'Mesero', permissions: 'Órdenes, mesas', members: 0 },
    { id: 5, name: 'Repartidor', permissions: 'Entregas', members: 0 },
  ];
  
  // Load users from Supabase
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Get profiles from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      console.log('Fetched profiles:', data);
      
      // Create usersWithEmail array with a default email when not available
      const usersWithEmail: UserProfile[] = data.map((profile) => ({
        ...profile,
        email: 'correo-no-disponible@ejemplo.com',
        role: profile.role as UserRole,
      }));
      
      setStaffMembers(usersWithEmail);
      
      // Update role counts
      const roleCounts = data.reduce((counts: Record<string, number>, profile) => {
        counts[profile.role] = (counts[profile.role] || 0) + 1;
        return counts;
      }, {});
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Filter staff based on search
  const filteredStaff = staffMembers.filter(staff => 
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    staff.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle user creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUserEmail || !newUserName || !newUserPassword || !newUserRole) {
      toast.error('Por favor complete todos los campos');
      return;
    }
    
    try {
      await createUser(
        newUserEmail,
        newUserPassword,
        newUserName,
        newUserRole
      );
      
      // El usuario ha sido creado en Supabase Auth pero necesitará confirmar su correo
      toast.success('Usuario creado exitosamente', {
        description: 'El usuario necesitará confirmar su correo electrónico para acceder.'
      });
      
      // Clear form
      setNewUserEmail('');
      setNewUserName('');
      setNewUserPassword('');
      setNewUserRole('waiter');
      setUserDialogOpen(false);
      
      // Reload user list
      fetchUsers();
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Error al crear el usuario');
    }
  };
  
  // Handle role update
  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      
      // Update local list
      setStaffMembers(prev => 
        prev.map(staff => 
          staff.id === userId 
            ? { ...staff, role: newRole } 
            : staff
        )
      );
      
      toast.success('Rol actualizado correctamente');
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Error al actualizar el rol');
    }
  };
  
  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatarFile || !currentUser) return;
    
    try {
      // Upload avatar to Supabase Storage
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Create the bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('avatars');
      if (bucketError && bucketError.message.includes('not found')) {
        await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 2, // 2MB
        });
      }
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile);
        
      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        toast.error('Error al subir la imagen');
        return;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      if (urlData) {
        // Update profile with avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar: urlData.publicUrl })
          .eq('id', currentUser.id);
          
        if (updateError) {
          console.error('Profile update error:', updateError);
          toast.error('Error al actualizar el perfil');
          return;
        }
        
        // Update local state
        setStaffMembers(prev => 
          prev.map(staff => 
            staff.id === currentUser.id 
              ? { ...staff, avatar: urlData.publicUrl } 
              : staff
          )
        );
        
        setAvatarUrl(urlData.publicUrl);
        toast.success('Imagen de perfil actualizada');
      }
    } catch (error) {
      console.error('Error handling avatar upload:', error);
      toast.error('Error al procesar la imagen');
    }
  };
  
  // Handle user status toggle
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      // In a real scenario, this would be done through a secure Edge Function
      toast.success(`Usuario ${currentStatus === 'active' ? 'desactivado' : 'activado'} correctamente`);
      
      // Update local list to simulate the change
      setStaffMembers(prev => 
        prev.map(staff => 
          staff.id === userId 
            ? { ...staff, status: currentStatus === 'active' ? 'inactive' : 'active' } 
            : staff
        )
      );
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast.error(error.message || 'Error al cambiar el estado del usuario');
    }
  };
  
  // Handle editing user details
  const handleEditUser = (staff: UserProfile) => {
    setCurrentUser(staff);
    setAvatarUrl(staff.avatar || null);
    setEditDialogOpen(true);
  };
  
  // Handle save user edits
  const handleSaveUserEdit = async () => {
    if (!currentUser) return;
    
    try {
      // Upload avatar if selected
      if (avatarFile) {
        await handleAvatarUpload();
      }
      
      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          name: currentUser.name,
        })
        .eq('id', currentUser.id);
        
      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Error al actualizar el perfil');
        return;
      }
      
      // Update local state
      setStaffMembers(prev => 
        prev.map(staff => 
          staff.id === currentUser.id 
            ? { ...currentUser }
            : staff
        )
      );
      
      setEditDialogOpen(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error saving user edit:', error);
      toast.error('Error al guardar los cambios');
    }
  };
  
  // Check if current user is admin
  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Personal</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw size={18} className="mr-2" /> Actualizar
            </Button>
            {isAdmin && (
              <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
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
                  <form onSubmit={handleCreateUser}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-name">Nombre Completo</Label>
                        <Input 
                          id="new-name" 
                          placeholder="Ej. Juan Pérez" 
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-email">Email</Label>
                        <Input 
                          id="new-email" 
                          type="email" 
                          placeholder="juan.perez@example.com" 
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Contraseña</Label>
                        <Input 
                          id="new-password" 
                          type="password" 
                          placeholder="Mínimo 6 caracteres" 
                          value={newUserPassword}
                          onChange={(e) => setNewUserPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-role">Rol</Label>
                        <Select 
                          value={newUserRole} 
                          onValueChange={(value) => setNewUserRole(value as UserRole)}
                        >
                          <SelectTrigger id="new-role">
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="waiter">Mesero</SelectItem>
                            <SelectItem value="kitchen">Cocina</SelectItem>
                            <SelectItem value="delivery">Repartidor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Crear Empleado</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
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
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="waiter">Mesero</SelectItem>
                        <SelectItem value="kitchen">Cocina</SelectItem>
                        <SelectItem value="delivery">Repartidor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Empleado</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No hay empleados que coincidan con la búsqueda
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStaff.map(staff => (
                          <TableRow key={staff.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={staff.avatar} />
                                  <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{staff.name}</p>
                                  <p className="text-sm text-muted-foreground truncate max-w-[180px]">{staff.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {staff.role === 'admin' ? 'Administrador' : 
                                 staff.role === 'manager' ? 'Gerente' : 
                                 staff.role === 'waiter' ? 'Mesero' : 
                                 staff.role === 'kitchen' ? 'Cocina' : 
                                 staff.role === 'delivery' ? 'Repartidor' : staff.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>{staff.email}</p>
                                <p className="text-muted-foreground">Creado: {new Date(staff.created_at).toLocaleDateString()}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {isAdmin && (
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
                                        <Badge variant="outline">
                                          {staff.role === 'admin' ? 'Administrador' : 
                                           staff.role === 'manager' ? 'Gerente' : 
                                           staff.role === 'waiter' ? 'Mesero' : 
                                           staff.role === 'kitchen' ? 'Cocina' : 
                                           staff.role === 'delivery' ? 'Repartidor' : staff.role}
                                        </Badge>
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Email</span>
                                          <span>{staff.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Fecha creación</span>
                                          <span>{new Date(staff.created_at).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                      
                                      <Separator />
                                      
                                      <div className="space-y-2">
                                        <Label>Cambiar Rol</Label>
                                        <Select 
                                          defaultValue={staff.role} 
                                          onValueChange={(value) => handleUpdateRole(staff.id, value as UserRole)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="admin">Administrador</SelectItem>
                                            <SelectItem value="manager">Gerente</SelectItem>
                                            <SelectItem value="waiter">Mesero</SelectItem>
                                            <SelectItem value="kitchen">Cocina</SelectItem>
                                            <SelectItem value="delivery">Repartidor</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                                      <Button 
                                        className="w-full" 
                                        variant="outline"
                                        onClick={() => handleEditUser(staff)}
                                      >
                                        Editar Detalles
                                      </Button>
                                      <Button 
                                        className="w-full" 
                                        variant="destructive"
                                        onClick={() => handleToggleUserStatus(staff.id, 'active')}
                                      >
                                        Desactivar Cuenta
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Roles y Permisos</CardTitle>
                  {isAdmin && (
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
                                <Checkbox id="perm-dashboard" />
                                <Label htmlFor="perm-dashboard">Dashboard</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox id="perm-orders" />
                                <Label htmlFor="perm-orders">Órdenes</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox id="perm-kitchen" />
                                <Label htmlFor="perm-kitchen">Cocina</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox id="perm-inventory" />
                                <Label htmlFor="perm-inventory">Inventario</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox id="perm-delivery" />
                                <Label htmlFor="perm-delivery">Entregas</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox id="perm-reports" />
                                <Label htmlFor="perm-reports">Reportes</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox id="perm-settings" />
                                <Label htmlFor="perm-settings">Configuración</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox id="perm-staff" />
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
                  )}
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
                    {roles.map(role => {
                      // Count members for each role
                      const roleName = role.name.toLowerCase();
                      const roleKey = roleName === 'administrador' ? 'admin' : 
                                     roleName === 'gerente' ? 'manager' : 
                                     roleName === 'mesero' ? 'waiter' : 
                                     roleName === 'cocina' ? 'kitchen' : 
                                     roleName === 'repartidor' ? 'delivery' : roleName;
                      
                      const memberCount = staffMembers.filter(
                        staff => staff.role === roleKey
                      ).length;
                      
                      return (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell>{role.permissions}</TableCell>
                          <TableCell>{memberCount}</TableCell>
                          <TableCell className="text-right">
                            {isAdmin && (
                              <Button variant="ghost" size="sm" className="gap-1">
                                Editar <ChevronDown size={14} />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Empleado</DialogTitle>
            <DialogDescription>
              Actualice la información del empleado.
            </DialogDescription>
          </DialogHeader>
          {currentUser && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <AvatarImage src={avatarUrl || currentUser.avatar} />
                  <AvatarFallback className="text-xl relative group">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-full">
                      <Upload size={20} />
                    </div>
                  </AvatarFallback>
                </Avatar>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarUrl(URL.createObjectURL(file));
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Haga clic en la imagen para cambiarla</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre Completo</Label>
                <Input 
                  id="edit-name" 
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  value={currentUser.email}
                  disabled
                />
                <p className="text-xs text-muted-foreground">El email no puede ser cambiado</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveUserEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Staff;
