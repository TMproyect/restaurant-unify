
import { toast } from "sonner";
import type { PrintJobStatus, RawPrintOptions } from '../types';

/**
 * Service for handling printer operations
 */
export class PrinterOperationsService {
  private activeJobs: PrintJobStatus[] = [];
  private jobIdCounter = 0;
  
  /**
   * Print raw data to a printer
   */
  public async printRaw(
    printerName: string,
    data: string,
    options?: RawPrintOptions
  ): Promise<boolean> {
    if (!window.qz) {
      console.error('QZ Tray not available for printing');
      toast.error("No se puede imprimir", {
        description: "QZ Tray no está disponible"
      });
      return false;
    }
    
    try {
      // Generate unique job ID
      const jobId = `job_${++this.jobIdCounter}_${Date.now()}`;
      
      // Create job status entry
      const job: PrintJobStatus = {
        id: jobId,
        printerName,
        status: 'pending',
        startTime: Date.now()
      };
      
      this.activeJobs.push(job);
      
      // Set up printer config
      const config = this.createPrinterConfig(printerName);
      
      // Create raw print data
      const printData = new Array(data);
      
      console.log(`Sending raw print job to ${printerName}`);
      
      // Update job status
      this.updateJobStatus(jobId, 'printing');
      
      // Send print job
      await window.qz.print(config, printData);
      
      console.log(`Print job completed successfully on ${printerName}`);
      
      // Update job status
      this.updateJobStatus(jobId, 'complete');
      
      return true;
    } catch (error) {
      console.error('Error printing raw data:', error);
      
      toast.error("Error al imprimir", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
      
      return false;
    }
  }
  
  /**
   * Create printer configuration for QZ Tray
   */
  private createPrinterConfig(printerName: string) {
    return window.qz.configs.create(printerName, {
      rasterize: false,
      altPrinting: false,
      encoding: 'UTF-8',
      copies: 1
    });
  }
  
  /**
   * Update the status of a print job
   */
  private updateJobStatus(jobId: string, status: PrintJobStatus['status'], error?: string): void {
    this.activeJobs = this.activeJobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status,
          endTime: status === 'complete' || status === 'failed' ? Date.now() : undefined,
          error: error
        };
      }
      return job;
    });
    
    // Clean up completed jobs after a while
    if (status === 'complete' || status === 'failed') {
      setTimeout(() => {
        this.activeJobs = this.activeJobs.filter(job => job.id !== jobId);
      }, 3600000); // Remove after 1 hour
    }
  }
  
  /**
   * Get all print jobs
   */
  public getJobs(): PrintJobStatus[] {
    return [...this.activeJobs];
  }
}
