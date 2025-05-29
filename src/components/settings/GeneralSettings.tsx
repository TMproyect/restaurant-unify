
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const GeneralSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>
            Ajustes generales del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Configuraciones generales del sistema como idioma, moneda, etc.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
