
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthUser, UserRole } from '@/contexts/auth/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdmin } from '@/hooks/use-admin';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const UserRoleInfo = () => {
  const { user, fetchAllUsers } = useAuth();
  const { isAdmin } = useAdmin();
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all users if admin
  useEffect(() => {
    const loadUsers = async () => {
      if (!isAdmin) {
        console.log("Not an admin, skipping fetching all users");
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        console.log("UserRoleInfo: Attempting to fetch all users");
        
        try {
          console.log("UserRoleInfo: Trying fetchAllUsers from context");
          const users = await fetchAllUsers();
          if (users && users.length > 0) {
            console.log("UserRoleInfo: Successfully fetched users from context:", users.length);
            setAllUsers(users);
          } else {
            throw new Error("No users found or empty result");
          }
        } catch (contextError) {
          console.error('UserRoleInfo: Error fetching with context method:', contextError);
          
          // Fallback to direct RPC call
          console.log("UserRoleInfo: Falling back to direct RPC call");
          const { data, error } = await supabase.rpc('get_all_profiles');
          
          if (error) {
            console.error("UserRoleInfo: Error fetching profiles with RPC:", error);
            throw error;
          }
          
          if (data) {
            // Ensure data is an array
            const profilesArray = Array.isArray(data) ? data : [data];
            console.log("UserRoleInfo: RPC function returned", profilesArray.length, "profiles");
            
            // Map the profile data to AuthUser format
            const users = profilesArray.map((profile: any) => ({
              id: profile?.id || '',
              name: profile?.name || 'Sin nombre',
              email: '', // We can't get emails directly this way
              role: (profile?.role as UserRole) || 'admin',
              avatar: profile?.avatar,
              created_at: profile?.created_at || ''
            }));
            
            setAllUsers(users);
          } else {
            console.log("UserRoleInfo: No data returned from RPC function");
            setAllUsers([]);
          }
        }
      } catch (error: any) {
        console.error('UserRoleInfo: Error loading users:', error);
        setError(error.message || 'Error al cargar los usuarios');
        toast.error('Error al cargar usuarios', { 
          description: error.message || 'No se pudieron obtener los datos de usuarios'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isAdmin, fetchAllUsers]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando información de usuarios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>
            Ocurrió un problema al cargar la información de usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tu información de usuario</CardTitle>
          <CardDescription>
            Detalles sobre tu cuenta y permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Nombre:</span>
                <span>{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Rol:</span>
                <span className="capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">¿Es administrador?:</span>
                <span>{isAdmin ? 'Sí' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">ID de usuario:</span>
                <span className="text-xs text-gray-500 truncate">{user?.id}</span>
              </div>
            </div>
          ) : (
            <p>No hay información de usuario disponible</p>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Todos los usuarios</CardTitle>
            <CardDescription>
              Como administrador, puedes ver todos los usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allUsers && allUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Fecha de creación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No se encontraron usuarios en el sistema
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserRoleInfo;
