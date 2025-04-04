
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Check, RefreshCcw, AlertTriangle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Integration = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
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
  
  useEffect(() => {
    fetchApiKey();
  }, []);
  
  const fetchApiKey = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'external_api_key')
        .single();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setApiKey(data.value);
      }
    } catch (err) {
      console.error("Error al cargar la API key:", err);
      toast({
        title: "Error",
        description: "No se pudo cargar la clave de API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const generateNewApiKey = async () => {
    try {
      setRefreshing(true);
      
      // Generar un nuevo API key
      const newKey = `pos_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      const { error } = await supabase
        .from('system_settings')
        .update({ 
          value: newKey,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'external_api_key');
      
      if (error) {
        throw error;
      }
      
      setApiKey(newKey);
      toast({
        title: "Éxito",
        description: "Se ha generado una nueva clave de API",
      });
    } catch (err) {
      console.error("Error al regenerar la API key:", err);
      toast({
        title: "Error",
        description: "No se pudo generar una nueva clave de API",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };
  
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
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Integración API Externa</h1>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Información importante</AlertTitle>
          <AlertDescription>
            Esta API permite la integración con sistemas externos como n8n para recibir pedidos automáticamente. 
            Proteja su clave API y asegúrese de utilizarla en entornos seguros.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="api-key">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="api-key">Clave API</TabsTrigger>
            <TabsTrigger value="documentation">Documentación</TabsTrigger>
            <TabsTrigger value="testing">Pruebas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-key">
            <Card>
              <CardHeader>
                <CardTitle>Clave API</CardTitle>
                <CardDescription>
                  Esta clave se utiliza para autenticar las solicitudes a la API desde sistemas externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Clave API para integraciones externas</Label>
                  <div className="flex space-x-2">
                    <Input 
                      type="text" 
                      value={apiKey} 
                      readOnly 
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(apiKey)}
                      disabled={!apiKey || loading}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Nombre del encabezado HTTP</Label>
                  <div className="flex space-x-2">
                    <Input 
                      type="text" 
                      value="x-api-key" 
                      readOnly 
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard("x-api-key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Este es el nombre del encabezado HTTP donde debe enviarse la clave API
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>URL del Endpoint</Label>
                  <div className="flex space-x-2">
                    <Input 
                      type="text" 
                      value={apiEndpoint} 
                      readOnly 
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(apiEndpoint)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="secondary" 
                  onClick={generateNewApiKey}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Regenerar Clave API
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="documentation">
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
                      Todas las solicitudes deben incluir el encabezado <code className="bg-muted px-1">x-api-key</code> con 
                      la clave API proporcionada en la sección "Clave API".
                    </p>
                    <code className="block bg-muted p-2 rounded">
                      x-api-key: {apiKey ? apiKey.substring(0, 10) + "..." : "[Su clave API]"}
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
                  
                  <div className="space-y-4 mt-6">
                    <h3 className="font-medium">Descripción de los Campos</h3>
                    
                    <div className="border rounded-lg divide-y">
                      <div className="grid grid-cols-12 p-2 font-medium bg-muted">
                        <div className="col-span-3">Campo</div>
                        <div className="col-span-2">Tipo</div>
                        <div className="col-span-2">Requerido</div>
                        <div className="col-span-5">Descripción</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">id_externo</div>
                        <div className="col-span-2">string</div>
                        <div className="col-span-2">No</div>
                        <div className="col-span-5">ID del pedido en el sistema externo</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">nombre_cliente</div>
                        <div className="col-span-2">string</div>
                        <div className="col-span-2">Sí</div>
                        <div className="col-span-5">Nombre del cliente que realiza el pedido</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">numero_mesa</div>
                        <div className="col-span-2">string</div>
                        <div className="col-span-2">Condicional</div>
                        <div className="col-span-5">Requerido si no se especifica is_delivery</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">is_delivery</div>
                        <div className="col-span-2">boolean</div>
                        <div className="col-span-2">Condicional</div>
                        <div className="col-span-5">Requerido si no se especifica numero_mesa</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">items_pedido</div>
                        <div className="col-span-2">array</div>
                        <div className="col-span-2">Sí</div>
                        <div className="col-span-5">Lista de productos del pedido</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">items_pedido[].sku_producto</div>
                        <div className="col-span-2">string</div>
                        <div className="col-span-2">Sí</div>
                        <div className="col-span-5">SKU único del producto en el sistema</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">items_pedido[].cantidad</div>
                        <div className="col-span-2">integer</div>
                        <div className="col-span-2">Sí</div>
                        <div className="col-span-5">Cantidad del producto</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">items_pedido[].precio_unitario</div>
                        <div className="col-span-2">number</div>
                        <div className="col-span-2">Sí</div>
                        <div className="col-span-5">Precio por unidad del producto</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">items_pedido[].notas_item</div>
                        <div className="col-span-2">string</div>
                        <div className="col-span-2">No</div>
                        <div className="col-span-5">Notas específicas para el producto</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">total_pedido</div>
                        <div className="col-span-2">number</div>
                        <div className="col-span-2">Sí</div>
                        <div className="col-span-5">Monto total del pedido</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">notas_generales_pedido</div>
                        <div className="col-span-2">string</div>
                        <div className="col-span-2">No</div>
                        <div className="col-span-5">Notas generales para todo el pedido</div>
                      </div>
                      
                      <div className="grid grid-cols-12 p-2">
                        <div className="col-span-3 font-mono text-sm">estado_pedido_inicial</div>
                        <div className="col-span-2">string</div>
                        <div className="col-span-2">Sí</div>
                        <div className="col-span-5">Estado inicial del pedido (pendiente, preparando, etc.)</div>
                      </div>
                    </div>
                  </div>
                  
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
          </TabsContent>
          
          <TabsContent value="testing">
            <Card>
              <CardHeader>
                <CardTitle>Probar la API</CardTitle>
                <CardDescription>
                  Utilice esta sección para probar la integración externa con herramientas como n8n, Postman o cURL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">cURL</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Utilice el siguiente comando cURL para enviar un pedido de prueba:
                  </p>
                  <Textarea 
                    value={`curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '${examplePayload}'`}
                    rows={8}
                    readOnly 
                    className="font-mono"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => copyToClipboard(`curl -X POST "${apiEndpoint}" -H "Content-Type: application/json" -H "x-api-key: ${apiKey}" -d '${examplePayload}'`, "Comando cURL copiado")}
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    Copiar comando
                  </Button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">n8n</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Configuración para n8n:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Utilice el nodo "HTTP Request"</li>
                    <li>Establezca el método a POST</li>
                    <li>URL: {apiEndpoint}</li>
                    <li>Añada el encabezado "x-api-key" con el valor de su clave API</li>
                    <li>Establezca "Content-Type" a "application/json"</li>
                    <li>En el cuerpo, proporcione un JSON con la estructura mostrada anteriormente</li>
                  </ol>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="mt-4"
                    asChild
                  >
                    <a href="https://n8n.io/integrations/http-request/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Documentación de n8n para HTTP Request
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Integration;
