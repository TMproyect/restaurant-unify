
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import printService from '@/services/printing/printService';

export interface PrintJob {
  id: string;
  type: 'receipt' | 'order' | 'kitchen' | 'custom';
  status: 'pending' | 'printing' | 'success' | 'error';
  error?: string;
  timestamp: Date;
}

export function usePrintJobStatus() {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [activePrintJob, setActivePrintJob] = useState<PrintJob | null>(null);
  
  const startPrintJob = useCallback((type: PrintJob['type']) => {
    // Check if printer service is connected
    if (!printService.isConnected()) {
      const jobError = 'Sistema de impresión no conectado';
      toast.error(jobError, {
        description: 'Intente reconectar antes de imprimir',
        action: {
          label: "Conectar",
          onClick: async () => {
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
          }
        }
      });
      
      // Add failed job to history
      const failedJob: PrintJob = {
        id: `job_${Date.now()}`,
        type,
        status: 'error',
        error: jobError,
        timestamp: new Date()
      };
      
      setPrintJobs(prev => [failedJob, ...prev]);
      return { success: false, jobId: failedJob.id };
    }
    
    // Create new print job
    const newJob: PrintJob = {
      id: `job_${Date.now()}`,
      type,
      status: 'pending',
      timestamp: new Date()
    };
    
    setPrintJobs(prev => [newJob, ...prev]);
    setActivePrintJob(newJob);
    
    return { success: true, jobId: newJob.id };
  }, []);
  
  const updatePrintJob = useCallback((jobId: string, update: Partial<PrintJob>) => {
    setPrintJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...update } : job
    ));
    
    if (activePrintJob?.id === jobId) {
      setActivePrintJob(prev => prev ? { ...prev, ...update } : null);
    }
    
    // Clear active job if completed
    if (update.status === 'success' || update.status === 'error') {
      if (activePrintJob?.id === jobId) {
        setActivePrintJob(null);
      }
    }
  }, [activePrintJob]);
  
  const printWithTracking = useCallback(async (
    type: PrintJob['type'],
    printFunction: () => Promise<void>
  ) => {
    const { success, jobId } = startPrintJob(type);
    
    if (!success) {
      return false;
    }
    
    try {
      updatePrintJob(jobId, { status: 'printing' });
      await printFunction();
      updatePrintJob(jobId, { status: 'success' });
      return true;
    } catch (error) {
      console.error('Print job error:', error);
      updatePrintJob(jobId, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      });
      return false;
    }
  }, [startPrintJob, updatePrintJob]);
  
  return {
    printJobs,
    activePrintJob,
    startPrintJob,
    updatePrintJob,
    printWithTracking
  };
}

export default usePrintJobStatus;
