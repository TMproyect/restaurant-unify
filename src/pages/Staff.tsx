
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { UserPlus, PencilIcon, UserCog, UploadIcon, RefreshCcw } from 'lucide-react';

import { useAuth } from '@/contexts/auth/AuthContext';
import { AuthUser, UserRole } from '@/contexts/auth/types';
import { supabase } from '@/integrations/supabase/client';
import { mapArrayResponse, filterValue } from '@/utils/supabaseHelpers';

interface StaffFormValues {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface EditRoleValues {
  role: UserRole;
}

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'waiter', label: 'Mesero' },
  { value: 'kitchen', label: 'Cocina' },
  { value: 'delivery', label: 'Delivery' }
];

const Staff: React.FC = () => {
  const { user, createUser, updateUserRole } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentUserEdit, setCurrentUserEdit] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState("all");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<StaffFormValues>();
  const editForm = useForm<EditRoleValues>();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Staff component: Cargando usuarios usando RPC function...');
      
      // Use the RPC function we created in the database
      const { data, error } = await supabase.rpc('get_all_profiles');
      
      if (error) {
        console.error('Error calling RPC function:', error);
        throw error;
      }
      
      if (data) {
        console.log('Staff component: RPC retornó', Array.isArray(data) ? data.length : 'no array', 'perfiles');
        
        // Ensure data is an array
        const profilesArray = Array.isArray(data) ? data : [data];
        
        const staffUsers = profilesArray.map((profile: any) => ({
          id: profile.id,
          name: profile.name || 'Sin nombre',
          email: '',
          role: profile.role as UserRole,
          avatar: profile.avatar,
          created_at: profile.created_at
        }));
        
        setUsers(staffUsers);
      }
    } catch (error: any) {
      console.error('Staff component: Error loading users:', error);
      setError(error.message || 'Error al cargar la lista de personal');
      toast.error('Error al cargar usuarios', {
        description: error.message || 'No se pudieron cargar los datos del personal'
      });
      
      // Fallback to direct query if RPC fails
      try {
        console.log('Staff component: Falling back to direct query...');
        
        const { data: directData, error: directError } = await supabase
          .from('profiles')
          .select('id, name, role, avatar, created_at')
          .order('created_at', { ascending: false });
        
        if (directError) {
          throw directError;
        }
        
        if (directData) {
          console.log('Staff component: Fallback query returned', directData.length, 'profiles');
          
          const staffUsers = directData.map(profile => ({
            id: profile.id,
            name: profile.name || 'Sin nombre',
            email: '',
            role: profile.role as UserRole,
            avatar: profile.avatar,
            created_at: profile.created_at
          }));
          
          setUsers(staffUsers);
        }
      } catch (fallbackError: any) {
        console.error('Staff component: Fallback query failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    setRefreshing(true);
    try {
      await loadUsers();
      toast.success('Lista de usuarios actualizada');
    } catch (error) {
      console.error('Error refreshing users:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onAddStaff = async (data: StaffFormValues) => {
    try {
      setIsSubmitting(true);
      await createUser(data.email, data.password, data.name, data.role);
      await loadUsers();
      setShowAddDialog(false);
      reset();
      toast.success(`Usuario ${data.name} creado con rol ${data.role}`);
    } catch (error: any) {
      console.error('Error adding staff:', error);
      toast.error(error.message || 'Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditRole = async (data: EditRoleValues) => {
    if (!currentUserEdit) return;
    
    try {
      setIsSubmitting(true);
      await updateUserRole(currentUserEdit.id, data.role);
      setUsers(users.map(u => 
        u.id === currentUserEdit.id 
          ? { ...u, role: data.role }
          : u
      ));
      setShowEditDialog(false);
      toast.success(`Rol de ${currentUserEdit.name} actualizado a ${data.role}`);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Error al actualizar rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditRole = (user: AuthUser) => {
    setCurrentUserEdit(user);
    editForm.setValue('role', user.role);
    setAvatarUrl(user.avatar || null);
    setShowEditDialog(true);
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !currentUserEdit) return;

    try {
      setUploading(true);
      
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
        
        if (!avatarBucketExists) {
          console.log('Creating avatars bucket...');
          const { error } = await supabase.storage.createBucket('avatars', {
            public: true
          });
          
          if (error) {
            console.error('Error creating avatars bucket:', error);
          }
        }
      } catch (e) {
        console.error('Error checking/creating bucket:', e);
      }
      
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${currentUserEdit.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar: publicUrl } as any)
        .eq('id', filterValue(currentUserEdit.id));
        
      if (updateError) throw updateError;
      
      setUsers(users.map(u => 
        u.id === currentUserEdit.id 
          ? { ...u, avatar: publicUrl }
          : u
      ));
      
      setAvatarUrl(publicUrl);
      
      toast.success('Avatar actualizado correctamente');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Error al subir avatar');
    } finally {
      setUploading(false);
    }
  };

  const filteredUsers = tab === 'all' 
    ? users 
    : users.filter(u => u.role === tab);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const getUserRoleLabel = (role: UserRole) => {
    const roleObj = ROLES.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
              <CardDescription>
                Ocurrió un problema al cargar la información del personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <Button 
                onClick={refreshUsers} 
                className="mt-4"
                variant="outline"
              >
                Intentar nuevamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const renderAddStaffDialog = () => (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onAddStaff)}>
          <DialogHeader>
            <DialogTitle>Agregar nuevo usuario</DialogTitle>
            <DialogDescription>
              Crea una nueva cuenta de personal para el restaurante.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Nombre completo"
                {...register("name", { required: "El nombre es obligatorio" })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                {...register("email", { 
                  required: "El correo es obligatorio",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Correo electrónico inválido"
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register("password", { 
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres"
                  }
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rol</Label>
              <Select 
                onValueChange={(value) => setValue('role', value as UserRole)} 
                defaultValue="waiter"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddDialog(false)} 
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Agregar Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderEditRoleDialog = () => (
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={editForm.handleSubmit(onEditRole)}>
          <DialogHeader>
            <DialogTitle>Editar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Cambiar el rol de {currentUserEdit?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <div className="p-2 bg-muted rounded text-sm">
                {currentUserEdit?.email || 'Sin correo electrónico'}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Rol</Label>
              <Select 
                onValueChange={(value) => editForm.setValue('role', value as UserRole)} 
                defaultValue={currentUserEdit?.role}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar Rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2 mt-4">
              <Label>Avatar</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || currentUserEdit?.avatar || ''} />
                  <AvatarFallback>
                    {currentUserEdit?.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={uploadAvatar}
                    disabled={!avatarFile || uploading}
                    className="w-full"
                  >
                    {uploading ? "Subiendo..." : "Subir Avatar"}
                    <UploadIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)} 
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Actualizar Rol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <Layout>
      {renderAddStaffDialog()}
      {renderEditRoleDialog()}
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestión de Personal</h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={refreshUsers}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCcw size={18} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Actualizando..." : "Actualizar"}
            </Button>
            
            {canEdit && (
              <Button 
                onClick={() => {
                  reset();
                  setShowAddDialog(true);
                }}
                className="flex items-center gap-2"
              >
                <UserPlus size={18} />
                Agregar Personal
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="admin">Administradores</TabsTrigger>
            <TabsTrigger value="manager">Gerentes</TabsTrigger>
            <TabsTrigger value="waiter">Meseros</TabsTrigger>
            <TabsTrigger value="kitchen">Cocina</TabsTrigger>
            <TabsTrigger value="delivery">Delivery</TabsTrigger>
          </TabsList>
          
          <TabsContent value={tab} className="mt-0">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    No hay personal con el rol seleccionado.
                  </div>
                ) : (
                  filteredUsers.map((staffUser) => (
                    <Card key={staffUser.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{staffUser.name}</CardTitle>
                          <span className={`text-xs px-2 py-1 rounded ${
                            staffUser.role === 'admin' 
                              ? 'bg-red-100 text-red-600' 
                              : staffUser.role === 'manager'
                              ? 'bg-purple-100 text-purple-600'
                              : staffUser.role === 'waiter'
                              ? 'bg-blue-100 text-blue-600'
                              : staffUser.role === 'kitchen'
                              ? 'bg-yellow-100 text-yellow-600'
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {getUserRoleLabel(staffUser.role)}
                          </span>
                        </div>
                        <CardDescription className="flex items-center mt-1">
                          <span className="text-sm truncate">{staffUser.email || 'Sin correo'}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="flex gap-4 items-center">
                          <Avatar className="h-16 w-16 border border-border">
                            <AvatarImage src={staffUser.avatar || ''} />
                            <AvatarFallback className="text-lg">
                              {staffUser.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              {staffUser.id === user?.id ? 'Tu cuenta' : 'ID: ' + staffUser.id.substring(0, 8)}
                            </p>
                            {staffUser.created_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Creado: {new Date(staffUser.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      {canEdit && staffUser.id !== user?.id && (
                        <CardFooter className="pt-0 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => startEditRole(staffUser)}
                          >
                            <UserCog size={16} />
                            Editar Rol
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Staff;
