
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
import { UserPlus, PencilIcon, UserCog, UploadIcon, RefreshCcw, UserX, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  { value: 'gerente', label: 'Gerente' },
  { value: 'mesero', label: 'Mesero' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'repartidor', label: 'Repartidor' }
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
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      if (!profiles || profiles.length === 0) {
        console.log("Staff: No profiles provided to fetchUserEmails");
        return profiles;
      }
      
      console.log(`Staff: Fetching emails for ${profiles.length} users:`, profiles.map(p => p.id));
      
      const userIds = profiles.map(p => p.id);
      
      console.log("Staff: User IDs being sent to edge function:", userIds);
      
      console.log("Staff: Invoking create-user-with-profile edge function with action=get_emails");
      const response = await supabase.functions.invoke('create-user-with-profile', {
        body: { 
          action: 'get_emails',
          userIds: userIds
        }
      });
      
      console.log('Staff: Edge function complete response:', response);
      
      if (response.error) {
        console.error('Staff: Error from edge function:', response.error);
        return profiles;
      }
      
      if (!response.data) {
        console.error('Staff: No data returned from edge function');
        return profiles;
      }
      
      const emailsMap = response.data || {};
      console.log('Staff: Emails map received:', emailsMap);
      
      const mappedProfiles = profiles.map(profile => {
        const email = emailsMap[profile.id] || profile.email || '';
        console.log(`Staff: Mapping email for user ${profile.id}: ${email}`);
        return {
          ...profile,
          email
        };
      });
      
      console.log('Staff: Profiles with mapped emails:', mappedProfiles);
      return mappedProfiles;
      
    } catch (error) {
      console.error('Staff: Error fetching user emails:', error);
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
        console.error('Staff component: Error calling RPC function:', error);
        throw error;
      }
      
      if (data) {
        console.log('Staff component: RPC retornó', Array.isArray(data) ? data.length : 'no array', 'perfiles');
        console.log('Staff component: RPC data:', data);
        
        const profilesArray = Array.isArray(data) ? data : [data];
        
        const staffUsers = profilesArray.map((profile: any) => {
          const normalizedRole = normalizeRoleName(profile.role);
          
          return {
            id: profile.id,
            name: profile.name || 'Sin nombre',
            email: '',
            role: normalizedRole as UserRole,
            avatar: profile.avatar,
            created_at: profile.created_at
          };
        });
        
        console.log('Staff component: Mapped profiles to staffUsers:', staffUsers);
        
        const usersWithEmails = await fetchUserEmails(staffUsers);
        console.log('Staff component: Users with emails:', usersWithEmails);
        setUsers(usersWithEmails);
      } else {
        console.log('Staff component: No data from RPC, setting empty users array');
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
          console.error('Staff component: Direct query error:', directError);
          throw directError;
        }
        
        if (directData) {
          console.log('Staff component: Fallback query returned', directData.length, 'profiles');
          console.log('Staff component: Fallback data:', directData);
          
          const staffUsers = directData.map(profile => {
            const normalizedRole = normalizeRoleName(profile.role);
            
            return {
              id: profile.id,
              name: profile.name || 'Sin nombre',
              email: '',
              role: normalizedRole as UserRole,
              avatar: profile.avatar,
              created_at: profile.created_at
            };
          });
          
          console.log('Staff component: Mapped profiles from fallback to staffUsers:', staffUsers);
          
          const usersWithEmails = await fetchUserEmails(staffUsers);
          console.log('Staff component: Users with emails from fallback:', usersWithEmails);
          setUsers(usersWithEmails);
        } else {
          console.log('Staff component: No data from fallback, setting empty users array');
          setUsers([]);
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
      console.log('Staff component: Refreshing users list');
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
      
      const response = await supabase.functions.invoke('create-user-with-profile', {
        body: { 
          email: data.email, 
          password: data.password, 
          name: data.name, 
          role: data.role 
        }
      });
      
      console.log('Staff component: Edge function response for user creation:', response);
      
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
      
      const normalizedRole = normalizeRoleName(data.role);
      
      console.log('Updating role for user:', currentUserEdit.id, 'to normalized role:', normalizedRole);
      
      const response = await supabase.functions.invoke('create-user-with-profile', {
        body: { 
          userId: currentUserEdit.id,
          role: normalizedRole,
          action: 'update_role' 
        }
      });
      
      console.log('Staff component: Edge function response for role update:', response);
      
      if (response.error) {
        throw new Error(response.error.message || 'Error al actualizar rol');
      }
      
      toast.success(`Rol de ${currentUserEdit.name} actualizado a ${getRoleDisplayName(normalizedRole)}`);
      setShowEditDialog(false);
      
      const updatedUser = response.data?.data;
      const updatedEmail = updatedUser?.email || currentUserEdit.email;
      
      console.log('Staff component: Updated user from response:', updatedUser);
      console.log(`Staff component: Using email ${updatedEmail} for updated user`);
      
      setUsers(users.map(u => 
        u.id === currentUserEdit.id 
          ? { ...u, role: normalizedRole as UserRole, email: updatedEmail }
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log('Staff component: Deleting user:', userToDelete.id);
      
      if (userToDelete.id === user?.id) {
        toast.error('No puedes eliminar tu propia cuenta');
        return;
      }

      // Try direct database deletion first as a fallback
      let deleteSuccess = false;
      let errorMessage = '';

      try {
        // First attempt: Use edge function
        const response = await supabase.functions.invoke('create-user-with-profile', {
          body: { 
            userId: userToDelete.id,
            action: 'delete_user',
            email: userToDelete.email || '',
            name: userToDelete.name || ''
          }
        });
        
        console.log('Staff component: Edge function response for user deletion:', response);
        
        if (response.error) {
          errorMessage = response.error.message || 'Error al eliminar usuario a través de función';
          console.error('Edge function error:', errorMessage);
          throw new Error(errorMessage);
        }
        
        deleteSuccess = true;
      } catch (edgeFunctionError) {
        console.error('Edge function approach failed, trying direct DB deletion:', edgeFunctionError);
        
        // Second attempt: Try direct deletion from profiles table
        try {
          const { error: profilesError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userToDelete.id);
          
          if (profilesError) {
            console.error('Error deleting from profiles:', profilesError);
            throw profilesError;
          }
          
          deleteSuccess = true;
        } catch (dbError: any) {
          console.error('Database deletion also failed:', dbError);
          errorMessage = dbError.message || 'Error al eliminar usuario de la base de datos';
          throw new Error(errorMessage);
        }
      }
      
      if (deleteSuccess) {
        toast.success(`Usuario ${userToDelete.name} eliminado correctamente`);
        setUsers(users.filter(u => u.id !== userToDelete.id));
      } else {
        toast.error('No se pudo eliminar el usuario', {
          description: errorMessage || 'Error desconocido'
        });
      }
      
      setUserToDelete(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Error al eliminar usuario');
    } finally {
      setIsDeleting(false);
    }
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

  const canEdit = user?.role === 'admin' || user?.role === 'propietario' || user?.role === 'gerente';

  const getUserRoleLabel = (role: UserRole) => {
    return getRoleDisplayName(role);
  };

  const normalizeRoleName = (role: string): UserRole => {
    switch (role) {
      case 'admin':
        return 'admin';
      case 'gerente':
        return 'gerente';
      case 'mesero':
        return 'mesero';
      case 'cocina':
        return 'cocina';
      case 'repartidor':
        return 'repartidor';
      default:
        return 'mesero';
    }
  };

  const getRoleDisplayName = (role: UserRole): string => {
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
              type="button"
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

  const renderDeleteDialog = () => (
    <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará al usuario <strong>{userToDelete?.name}</strong> permanentemente.
            No podrás deshacer esta acción después.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDeleteUser();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <Layout>
      {renderAddStaffDialog()}
      {renderEditRoleDialog()}
      {renderDeleteDialog()}
      
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
            <TabsTrigger value="gerente">Gerentes</TabsTrigger>
            <TabsTrigger value="mesero">Meseros</TabsTrigger>
            <TabsTrigger value="cocina">Cocina</TabsTrigger>
            <TabsTrigger value="repartidor">Repartidor</TabsTrigger>
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
                              : staffUser.role === 'gerente'
                              ? 'bg-purple-100 text-purple-600'
                              : staffUser.role === 'mesero'
                              ? 'bg-blue-100 text-blue-600'
                              : staffUser.role === 'cocina'
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
                        <CardFooter className="pt-0 flex justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => startEditRole(staffUser)}
                          >
                            <UserCog size={16} />
                            Editar Rol
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="flex items-center gap-1 text-destructive hover:text-destructive hover:bg-red-100"
                            onClick={() => setUserToDelete(staffUser)}
                          >
                            <Trash2 size={16} />
                            Eliminar
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
