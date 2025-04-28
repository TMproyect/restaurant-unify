
import React from 'react';
import { usePrintJobStatus, PrintJob } from '@/hooks/use-print-job-status';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, X, Info, Bell } from 'lucide-react';
import { toast } from 'sonner';
import printService from '@/services/printing/printService';

export function PrintJobMonitor() {
  const { printJobs, activePrintJob } = usePrintJobStatus();
  
  const handleRetryConnection = async () => {
    try {
      const connected = await printService.connect();
      if (connected) {
        toast.success('Sistema de impresión conectado');
      } else {
        toast.error('No se pudo conectar al sistema de impresión');
      }
    } catch (error) {
      console.error('Error connecting to print service:', error);
      toast.error('Error al conectar con el sistema de impresión');
    }
  };
  
  if (printJobs.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <p>No hay historial de trabajos de impresión</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activePrintJob && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Trabajo de impresión activo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <PrintJobItem job={activePrintJob} isActive={true} />
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto p-0.5">
        {printJobs.slice(0, 10).map(job => (
          <PrintJobItem key={job.id} job={job} />
        ))}
      </div>
      
      {printJobs.some(job => job.status === 'error') && (
        <CardFooter className="px-0 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={handleRetryConnection}
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Reintentar conexión de impresión
          </Button>
        </CardFooter>
      )}
    </div>
  );
}

function PrintJobItem({ job, isActive = false }: { job: PrintJob, isActive?: boolean }) {
  const getJobTypeLabel = (type: PrintJob['type']) => {
    switch (type) {
      case 'receipt': return 'Ticket de Pago';
      case 'order': return 'Pre-cuenta';
      case 'kitchen': return 'Comanda de Cocina';
      case 'custom': return 'Impresión Personalizada';
      default: return type;
    }
  };
  
  const getStatusBadge = (status: PrintJob['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pendiente</Badge>;
      case 'printing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin" /> Imprimiendo
        </Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <Check className="h-3 w-3" /> Completado
        </Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <X className="h-3 w-3" /> Error
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Desconocido</Badge>;
    }
  };

  return (
    <div className={`p-3 rounded-md border ${isActive ? 'border-blue-200 bg-blue-50' : 'bg-white'}`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium text-sm">{getJobTypeLabel(job.type)}</div>
          <div className="text-xs text-muted-foreground">
            {job.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div>
          {getStatusBadge(job.status)}
        </div>
      </div>
      {job.error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-1.5 rounded">
          {job.error}
        </div>
      )}
    </div>
  );
}
