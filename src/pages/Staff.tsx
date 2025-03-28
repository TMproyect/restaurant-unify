
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

  const fetchUserEmails = async (profiles: AuthUser[]) => {
    try {
      // Only fetch emails if there are profiles to fetch emails for
      if (!profiles || profiles.length === 0) return profiles;
      
      console.log(`Staff: Fetching emails for ${profiles.length} users`);
      
      // Create array of user IDs to fetch emails for
      const userIds = profiles.map(p => p.id);
      
      // Call the edge function to get emails
      const response = await supabase.functions.invoke('create-user-with-profile', {
        body: { 
          action: 'get_emails',
          userIds: userIds
        }
      });
      
      console.log('Edge function response for email fetch:', response);
      
      if (response.error) {
        console.error('Error fetching emails:', response.error);
        return profiles;
      }
      
      // Map the emails to the profiles
      const emailsMap = response.data || {};
      
      return profiles.map(profile => ({
        ...profile,
        email: emailsMap[profile.id] || profile.email || ''
      }));
      
    } catch (error) {
      console.error('Error fetching user emails:', error);
      return profiles;
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Staff component: Cargando usuarios usando RPC function...');
      
      const { data, error } = await supabase.rpc('get_all_profiles');
      
      if (error) {
        console.error('Error calling RPC function:', error);
        throw error;
      }
      
      if (data) {
        console.log('Staff component: RPC retornó', Array.isArray(data) ? data.length : 'no array', 'perfiles');
        
        const profilesArray = Array.isArray(data) ? data : [data];
        
        const staffUsers = profilesArray.map((profile: any) => ({
          id: profile.id,
          name: profile.name || 'Sin nombre',
          email: '',
          role: profile.role as UserRole,
          avatar: profile.avatar,
          created_at: profile.created_at
        }));
        
        // Fetch emails for all users
        const usersWithEmails = await fetchUserEmails(staffUsers);
        setUsers(usersWithEmails);
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Staff component: Error loading users:', error);
      setError(error.message || 'Error al cargar la lista de personal');
      toast.error('Error al cargar usuarios', {
        description: error.message || 'No se pudieron cargar los datos del personal'
      });
      
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
          
          // Fetch emails for all users
          const usersWithEmails = await fetchUserEmails(staffUsers);
          setUsers(usersWithEmails);
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
      console.log('Creating user with data:', data);
      
      // Use edge function directly to create user
      const response = await supabase.functions.invoke('create-user-with-profile', {
        body: { 
          email: data.email, 
          password: data.password, 
          name: data.name, 
          role: data.role 
        }
      });
      
      console.log('Edge function response:', response);
      
      if (response.error) {
        throw new Error(response.error.message || 'Error al crear usuario');
      }
      
      toast.success(`Usuario ${data.name} creado con rol ${data.role}`);
      reset();
      setShowAddDialog(false);
      
      setTimeout(() => {
        loadUsers();
      }, 2000);
      
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
      console.log('Updating role for user:', currentUserEdit.id, 'to', data.role);
      
      // Use edge function directly to update role
      const response = await supabase.functions.invoke('create-user-with-profile', {
        body: { 
          userId: currentUserEdit.id,
          role: data.role,
          action: 'update_role' 
        }
      });
      
      console.log('Edge function response for role update:', response);
      
      if (response.error) {
        throw new Error(response.error.message || 'Error al actualizar rol');
      }
      
      toast.success(`Rol de ${currentUserEdit.name} actualizado a ${data.role}`);
      setShowEditDialog(false);
      
      // Use the email from the response if available
      const updatedUser = response.data?.data;
      const updatedEmail = updatedUser?.email || currentUserEdit.email;
      
      setUsers(users.map(u => 
        u.id === currentUserEdit.id 
          ? { ...u, role: data.role, email: updatedEmail }
          : u
      ));
      
      setTimeout(() => {
        loadUsers();
      }, 2000);
      
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
        
      // Use edge function to update avatar
      const { error: updateError } = await supabase.functions.invoke('create-user-with-profile', {
        body: { 
          userId: currentUserEdit.id,
          avatar: publicUrl,
          action: 'update_avatar' 
        }
      });
        
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
              type="button"
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
