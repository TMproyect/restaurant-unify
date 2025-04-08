
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FieldDescriptionTable from './FieldDescriptionTable';

interface DocumentationTabProps {
  apiKey: string;
}

const DocumentationTab: React.FC<DocumentationTabProps> = ({ apiKey }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const { toast } = useToast();
  
  const projectUrl = window.location.origin;
  const apiEndpoint = `${projectUrl}/api/v1/ingresar-pedido`;
  
  // Ejemplo de payload para la documentación
  const examplePayload = `{
  "id_externo": "order-123",
  "nombre_cliente": "Juan Pérez",
  "numero_mesa": "5",
  "items_pedido": [
    {
      "sku_producto": "HAM001",
      "cantidad": 2,
      "precio_unitario": 8.50,
      "notas_item": "Sin cebolla"
    },
    {
      "sku_producto": "BEBCOC001",
      "cantidad": 1,
      "precio_unitario": 5.00
    }
  ],
  "total_pedido": 22.00,
  "notas_generales_pedido": "Cliente frecuente",
  "estado_pedido_inicial": "pendiente"
}`;
  
  // Ejemplo de respuesta para la documentación
  const exampleResponse = `{
  "success": true,
  "message": "Pedido creado correctamente",
  "pos_order_id": "123e4567-e89b-12d3-a456-426614174000",
  "created_at": "2025-04-04T10:30:00.000Z"
}`;

  const copyToClipboard = (text: string, message: string = "Copiado al portapapeles") => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        toast({ title: "Éxito", description: message });
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        toast({
          title: "Error",
          description: "No se pudo copiar al portapapeles",
          variant: "destructive",
        });
      }
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Introducción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Esta API permite recibir pedidos desde sistemas externos como n8n, aplicaciones web o móviles.
            Los pedidos se procesarán y se registrarán en el sistema POS automáticamente.
          </p>
          
          <div className="space-y-2">
            <h3 className="font-medium">URL Base</h3>
            <code className="block bg-muted p-2 rounded">
              {apiEndpoint}
            </code>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Autenticación</h3>
            <p>
              Todas las solicitudes deben incluir el encabezado <code className="bg-muted px-1">Authorization</code> con 
              el formato Bearer seguido de la clave API proporcionada en la sección "Clave API".
            </p>
            <code className="block bg-muted p-2 rounded">
              Authorization: Bearer {apiKey ? apiKey.substring(0, 10) + "..." : "[Su clave API]"}
            </code>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Crear un Nuevo Pedido</CardTitle>
          <CardDescription>POST {apiEndpoint}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="font-medium">Parámetros de Solicitud</h3>
          <p>
            Se espera un objeto JSON con la siguiente estructura:
          </p>
          
          <div className="space-y-2">
            <Label>Ejemplo de Payload</Label>
            <Textarea 
              value={examplePayload} 
              rows={15}
              readOnly 
              className="font-mono"
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => copyToClipboard(examplePayload, "Ejemplo de payload copiado")}
            >
              <Copy className="mr-2 h-3 w-3" />
              Copiar ejemplo
            </Button>
          </div>
          
          <FieldDescriptionTable />
          
          <div className="space-y-2 mt-6">
            <h3 className="font-medium">Respuesta</h3>
            <p>
              La API responderá con un objeto JSON y un código de estado HTTP adecuado:
            </p>
            
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Éxito (201 Created)</h4>
              <Textarea 
                value={exampleResponse} 
                rows={6}
                readOnly 
                className="font-mono"
              />
            </div>
            
            <div className="space-y-1 mt-4">
              <h4 className="text-sm font-semibold">Error (4xx/5xx)</h4>
              <Textarea 
                value={`{
  "error": "Mensaje de error específico"
}`}
                rows={3}
                readOnly 
                className="font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentationTab;
