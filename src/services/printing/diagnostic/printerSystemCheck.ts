
import { toast } from "sonner";

interface SystemCheckResult {
  success: boolean;
  issue?: string;
  details?: string;
}

/**
 * Utility class to diagnose system-level printer issues
 */
export class PrinterSystemCheck {
  /**
   * Check if QZ Tray has permission to access system printers
   */
  public static async checkPrinterAccess(): Promise<SystemCheckResult> {
    if (!window.qz) {
      return {
        success: false,
        issue: "QZ Tray no está disponible",
        details: "Verifique que QZ Tray esté instalado y en ejecución"
      };
    }
    
    try {
      // Test if we can at least get a list (even if empty)
      await window.qz.printers.find();
      return { success: true };
    } catch (error) {
      console.error("Error accessing printer system:", error);
      
      let issue = "Error de acceso a impresoras";
      let details = "QZ Tray no puede acceder al sistema de impresoras";
      
      if (error instanceof Error) {
        if (error.message.includes("permission") || error.message.includes("access denied")) {
          issue = "Problema de permisos";
          details = "QZ Tray no tiene permisos suficientes para acceder a las impresoras";
        }
      }
      
      return {
        success: false,
        issue,
        details
      };
    }
  }
  
  /**
   * Check if the system's print service is running
   * Note: This is an indirect check as we can't directly check the OS print spooler
   */
  public static async checkPrintService(): Promise<SystemCheckResult> {
    try {
      const accessCheck = await this.checkPrinterAccess();
      if (!accessCheck.success) {
        return accessCheck;
      }
      
      // If we can access the printer system but find no printers,
      // the spooler might be running but there are no printers installed
      const printers = await window.qz.printers.find();
      if (!printers || printers.length === 0) {
        return {
          success: false,
          issue: "No hay impresoras instaladas",
          details: "El servicio de impresión está funcionando, pero no hay impresoras configuradas"
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error checking print service:", error);
      return {
        success: false,
        issue: "Error al verificar el servicio de impresión",
        details: error instanceof Error ? error.message : "Error desconocido"
      };
    }
  }
  
  /**
   * Run comprehensive diagnostics on the printing system
   */
  public static async runDiagnostics(): Promise<{
    overallStatus: boolean;
    results: {
      qzAvailable: boolean;
      printerAccess: SystemCheckResult;
      printService: SystemCheckResult;
      printersFound: number;
    };
    recommendations: string[];
  }> {
    const results = {
      qzAvailable: !!window.qz,
      printerAccess: { success: false },
      printService: { success: false },
      printersFound: 0
    };
    
    const recommendations: string[] = [];
    
    // Only proceed with tests if QZ is available
    if (!results.qzAvailable) {
      recommendations.push("Instale y ejecute QZ Tray");
      return {
        overallStatus: false,
        results,
        recommendations
      };
    }
    
    // Check printer access
    results.printerAccess = await this.checkPrinterAccess();
    if (!results.printerAccess.success) {
      recommendations.push("Ejecute QZ Tray como administrador");
      recommendations.push("Verifique los permisos de QZ Tray");
    }
    
    // Check print service
    results.printService = await this.checkPrintService();
    if (!results.printService.success) {
      recommendations.push("Reinicie el servicio de impresión del sistema operativo");
      recommendations.push("Verifique que tenga impresoras instaladas en el sistema");
    }
    
    // Count printers
    try {
      const printers = await window.qz.printers.find();
      results.printersFound = printers ? printers.length : 0;
      
      if (results.printersFound === 0) {
        recommendations.push("Instale al menos una impresora en su sistema operativo");
        recommendations.push("Verifique que la impresora esté encendida y conectada");
      }
    } catch (error) {
      console.error("Error counting printers:", error);
      results.printersFound = 0;
    }
    
    const overallStatus = results.qzAvailable && 
                           results.printerAccess.success && 
                           results.printService.success && 
                           results.printersFound > 0;
    
    return {
      overallStatus,
      results,
      recommendations
    };
  }
}
