
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, RefreshCw } from 'lucide-react';
import printService from '@/services/printing/printService';
import { toast } from 'sonner';

interface TestPrintButtonProps {
  printerName: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function TestPrintButton({ 
  printerName, 
  variant = "outline", 
  size = "sm" 
}: TestPrintButtonProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  
  const handleTestPrint = async () => {
    if (!printerName) {
      toast.error("No se ha seleccionado una impresora");
      return;
    }
    
    setIsPrinting(true);
    
    try {
      // Check connection first
      if (!printService.isConnected()) {
        toast({
          title: "Sistema de impresión desconectado",
          description: "Intentando reconectar...",
        });
        
        const connected = await printService.connect();
        if (!connected) {
          toast.error("No se pudo conectar al sistema de impresión");
          return;
        }
      }
      
      // Create simple test print data
      const testData = [
        '\x1B\x40',          // Initialize printer
        '\x1B\x45\x01',      // Bold on
        'TEST PRINT\n',
        '\x1B\x45\x00',      // Bold off
        '-----------------\n',
        'Printer: ' + printerName + '\n',
        'Date: ' + new Date().toLocaleString() + '\n',
        '-----------------\n',
        'Status: OK\n\n\n',
        '\x1B\x64\x03',      // Feed 3 lines
        '\x1D\x56\x00'       // Cut paper
      ].join('');
      
      const result = await printService.printRaw(printerName, testData);
      
      if (result) {
        toast.success("Impresión de prueba enviada correctamente");
      } else {
        toast.error("Error al enviar la impresión de prueba");
      }
    } catch (error) {
      console.error("Error en impresión de prueba:", error);
      toast.error("Error al imprimir", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
    } finally {
      setIsPrinting(false);
    }
  };
  
  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleTestPrint}
      disabled={isPrinting}
    >
      {isPrinting ? (
        <>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          Imprimiendo...
        </>
      ) : (
        <>
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Imprimir Prueba
        </>
      )}
    </Button>
  );
}
