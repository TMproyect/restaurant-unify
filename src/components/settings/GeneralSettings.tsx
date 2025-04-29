
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const GeneralSettings = () => {
  return (
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
  );
};

export default GeneralSettings;
