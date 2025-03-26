
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';

const UpgradeToAdmin = () => {
  const { user, updateUserRole } = useAuth();

  // Don't render the component if user is admin or not logged in
  if (!user || user.role === 'admin') {
    return null;
  }

  const handleUpgradeToAdmin = async () => {
    try {
      await updateUserRole(user.id, 'admin');
      toast.success('¡Felicidades! Ahora tienes permisos de administrador');
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      toast.error('Error al actualizar tu rol a administrador');
    }
  };

  return (
    <Card className="mb-6 border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-600" />
          Actualizar permisos
        </CardTitle>
        <CardDescription>
          Actualmente tienes el rol de <strong className="capitalize">{user.role}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Si necesitas acceso completo a todas las funciones del sistema, actualiza tu cuenta al rol de Administrador.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpgradeToAdmin} variant="default" className="bg-amber-600 hover:bg-amber-700">
          Convertir en Administrador
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpgradeToAdmin;
