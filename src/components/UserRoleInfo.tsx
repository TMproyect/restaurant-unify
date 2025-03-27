
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthUser } from '@/contexts/auth/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdmin } from '@/hooks/use-admin';

const UserRoleInfo = () => {
  const { user, fetchAllUsers } = useAuth();
  const { isAdmin } = useAdmin();
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all users if admin
  useEffect(() => {
    const loadUsers = async () => {
      if (isAdmin) {
        setLoading(true);
        try {
          const users = await fetchAllUsers();
          setAllUsers(users);
        } catch (error) {
          console.error('Error loading users:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUsers();
  }, [isAdmin, fetchAllUsers]);

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
          </div>
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
            {loading ? (
              <div>Cargando usuarios...</div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserRoleInfo;
