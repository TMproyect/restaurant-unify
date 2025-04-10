
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';

interface N8nManualConfigProps {
  apiEndpoint: string;
}

export const N8nManualConfig: React.FC<N8nManualConfigProps> = ({ apiEndpoint }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración manual para n8n</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Configuración recomendada para n8n</AlertTitle>
          <AlertDescription>
            Si estás teniendo problemas para conectar con n8n, asegúrate de configurar los siguientes parámetros:
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">URL del endpoint</h3>
            <p className="text-sm text-muted-foreground">
              {apiEndpoint}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Método HTTP</h3>
            <p className="text-sm text-muted-foreground">POST</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Autenticación</h3>
            <p className="text-sm text-muted-foreground">
              Selecciona <strong>None</strong> en la sección de Authentication
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Headers (recomendado para n8n)</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted px-2 py-1 rounded">x-api-key</div>
              <div className="bg-muted px-2 py-1 rounded">[Tu API Key]</div>
              <div className="bg-muted px-2 py-1 rounded">Content-Type</div>
              <div className="bg-muted px-2 py-1 rounded">application/json</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Formato alternativo de Header</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-muted px-2 py-1 rounded">Authorization</div>
              <div className="bg-muted px-2 py-1 rounded">Bearer [Tu API Key]</div>
              <div className="bg-muted px-2 py-1 rounded">Content-Type</div>
              <div className="bg-muted px-2 py-1 rounded">application/json</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
