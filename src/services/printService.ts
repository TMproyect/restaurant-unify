// QZ Tray service for handling printer connections
import { toast } from "sonner";
import type { PrinterConnectionStatus, PrinterConfig } from './printing/types';

// Re-use the global Window interface from types.ts, not redefine it
// Define the global qz object is now handled in types.ts

class PrintService {
  private isReady = false;
  private connectionStatus: PrinterConnectionStatus = 'disconnected';
  private availablePrinters: PrinterConfig[] = [];
  private defaultPrinter: string | null = null;
  private statusCallbacks: ((status: PrinterConnectionStatus) => void)[] = [];
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private qzCheckInterval: number | null = null;
  private qzWaitAttempts = 0;
  private maxQzWaitAttempts = 120; // 60 segundos a 500ms por intento

  constructor() {
    // Initialize when the service is created
    this.initialize();
  }

  // Initialize the service and QZ Tray
  private initialize() {
    console.log("%c🖨️ PrintService: Iniciando servicio de impresión", "background: #004D40; color: white; padding: 2px 4px; border-radius: 2px;");
    
    if (typeof window !== 'undefined') {
      console.log("%c🖨️ PrintService: Configurando escucha de eventos para QZ Tray", "background: #004D40; color: white; padding: 2px 4px; border-radius: 2px;");
      
      // Verificación inmediata por si QZ ya está disponible
      this.checkQzAvailability();
      
      // Escuchar el evento personalizado desde el script en index.html
      window.addEventListener('qz-tray-available', (event: CustomEvent) => {
        console.log("%c🖨️ PrintService: Evento QZ-TRAY-AVAILABLE recibido", "background: #00796B; color: white; padding: 2px 4px; border-radius: 2px;");
        if (this.isReady) return;
        
        if (this.qzCheckInterval) {
          window.clearInterval(this.qzCheckInterval);
          this.qzCheckInterval = null;
        }
        
        this.setupService();
      });
      
      // Además, configurar un intervalo como respaldo
      this.qzCheckInterval = window.setInterval(() => {
        this.checkQzAvailability();
      }, 3000); // Comprobar cada 3 segundos
    }
  }

  // Comprobar si QZ Tray está disponible
  private checkQzAvailability() {
    console.log("%c🖨️ PrintService: Verificación periódica de QZ Tray", "color: #004D40;");
    console.log("%c🖨️ PrintService: window.qz =", "color: #004D40;", window.qz ? "DISPONIBLE" : "NO DISPONIBLE");
    
    if (window.qz) {
      console.log("%c🖨️ PrintService: QZ Tray detectado en verificación periódica", "background: #00796B; color: white; padding: 2px 4px; border-radius: 2px;");
      
      // Si ya estamos listos, no hacer nada
      if (this.isReady) {
        return;
      }

      // Detener el intervalo de comprobación si QZ Tray está disponible
      if (this.qzCheckInterval) {
        console.log("%c🖨️ PrintService: Deteniendo comprobación periódica de QZ Tray", "color: #004D40;");
        window.clearInterval(this.qzCheckInterval);
        this.qzCheckInterval = null;
      }

      this.setupService();
    } else {
      console.log("%c🖨️ PrintService: QZ Tray no disponible en esta comprobación", "color: #FF5722;");
    }
  }

  // Asegurarse de que QZ Tray esté cargado, con reintentos
  public async isQzAvailable(): Promise<boolean> {
    console.log("%c🖨️ PrintService: Verificando disponibilidad de QZ Tray", "background: #004D40; color: white; padding: 2px 4px; border-radius: 2px;");
    console.log("%c🖨️ PrintService: window.qz =", "color: #004D40;", window.qz ? "DISPONIBLE" : "NO DISPONIBLE");
    
    // Si QZ Tray ya está disponible, devolvemos true inmediatamente
    if (window.qz) {
      console.log("%c🖨️ PrintService: QZ Tray ya está disponible", "background: #00796B; color: white; padding: 2px 4px; border-radius: 2px;");
      
      // Configurar el servicio si aún no está listo
      if (!this.isReady) {
        this.setupService();
      }
      
      return true;
    }
    
    // Verificamos si el archivo está parcialmente cargado (existe la etiqueta script)
    const qzScriptTags = document.querySelectorAll('script[src*="qz-tray"]');
    if (qzScriptTags.length === 0) {
      console.warn("%c🖨️ PrintService: No se encontró ninguna etiqueta script de QZ Tray", "background: #F44336; color: white; padding: 2px 4px; border-radius: 2px;");
      
      // Intento de cargar dinámicamente el script
      try {
        console.log("%c🖨️ PrintService: Intentando cargar QZ Tray dinámicamente", "color: #FFA000;");
        const script = document.createElement('script');
        script.src = '/qz-tray.min.js';
        script.defer = true;
        document.head.appendChild(script);
        console.log("%c🖨️ PrintService: Script QZ Tray añadido dinámicamente", "color: #FFA000;");
      } catch (err) {
        console.error("%c🖨️ PrintService: Error al añadir script dinámicamente", "background: #F44336; color: white;", err);
      }
    }
    
    // Si QZ Tray no está disponible inmediatamente, intentamos esperar
    try {
      console.log("%c🖨️ PrintService: QZ Tray no está inmediatamente disponible, intentando esperar", "color: #FFA000;");
      await this.waitForQZ();
      
      console.log("%c🖨️ PrintService: QZ Tray disponible después de esperar", "background: #00796B; color: white; padding: 2px 4px; border-radius: 2px;");
      
      if (!this.isReady) {
        this.setupService();
      }
      
      return true;
    } catch (error) {
      console.error("%c🖨️ PrintService: Error al esperar QZ Tray:", "background: #F44336; color: white; padding: 2px 4px; border-radius: 2px;", error);
      return false;
    }
  }
  
  // Esperar a que QZ Tray esté disponible
  private waitForQZ(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.qz) {
        console.log("%c🖨️ PrintService: QZ Tray detectado inmediatamente en waitForQZ", "background: #00796B; color: white; padding: 2px 4px; border-radius: 2px;");
        resolve();
        return;
      }

      console.log("%c🖨️ PrintService: Esperando a QZ Tray...", "color: #FFA000;");

      // Reiniciar contador de intentos
      this.qzWaitAttempts = 0;
      
      // También escuchar el evento como método alternativo
      const eventListener = (event: CustomEvent) => {
        console.log("%c🖨️ PrintService: QZ Tray disponible via evento personalizado", "background: #00796B; color: white; padding: 2px 4px; border-radius: 2px;");
        window.removeEventListener('qz-tray-available', eventListener as EventListener);
        resolve();
      };
      
      window.addEventListener('qz-tray-available', eventListener as EventListener);
      
      // Check every 500ms for up to maxQzWaitAttempts times
      const interval = setInterval(() => {
        this.qzWaitAttempts++;

        // Verificamos si qz está disponible ahora
        if (window.qz) {
          console.log(`%c🖨️ PrintService: QZ Tray detectado después de ${this.qzWaitAttempts * 0.5} segundos`, "background: #00796B; color: white; padding: 2px 4px; border-radius: 2px;");
          clearInterval(interval);
          window.removeEventListener('qz-tray-available', eventListener as EventListener);
          resolve();
          return;
        }
        
        // Log periodically but not on every attempt to avoid console spam
        if (this.qzWaitAttempts % 5 === 0) {
          console.log(`%c🖨️ PrintService: Esperando QZ Tray... (${this.qzWaitAttempts * 0.5}s / ${this.maxQzWaitAttempts * 0.5}s)`, "color: #FFA000;");
          console.log("%c🖨️ PrintService: Estado actual de window.qz =", "color: #FFA000;", window.qz || "undefined");
        }
        
        if (this.qzWaitAttempts >= this.maxQzWaitAttempts) {
          console.log(`%c🖨️ PrintService: QZ Tray no disponible después de ${this.maxQzWaitAttempts * 0.5} segundos`, "background: #F44336; color: white; padding: 2px 4px; border-radius: 2px;");
          console.log("%c🖨️ PrintService: Verificación final de window.qz =", "color: #F44336;", window.qz || "undefined");
          clearInterval(interval);
          window.removeEventListener('qz-tray-available', eventListener as EventListener);
          reject(new Error(`QZ Tray no disponible después de ${this.maxQzWaitAttempts * 0.5} segundos`));
        }
      }, 500);
    });
  }

  // Configure service after QZ is available
  private setupService() {
    this.isReady = true;
    this.setupCallbacks();
    console.log('PrintService: Servicio QZ Tray inicializado');
    
    // Si ya hay una conexión activa, actualizar estado
    if (window.qz && window.qz.websocket && window.qz.websocket.isActive()) {
      console.log('PrintService: Conexión WebSocket ya activa');
      this.updateStatus('connected');
      this.refreshPrinters().catch(err => {
        console.error('PrintService: Error al refrescar impresoras durante inicialización:', err);
      });
    } else {
      console.log('PrintService: No hay conexión WebSocket activa');
      this.updateStatus('disconnected');
    }
  }

  // Set up QZ Tray callbacks
  private setupCallbacks() {
    if (!window.qz || !window.qz.websocket) {
      console.error("PrintService: No se pueden configurar callbacks, QZ Tray no disponible o no inicializado correctamente");
      return;
    }

    console.log("PrintService: Configurando callbacks de QZ Tray");

    // Error callback
    window.qz.websocket.setErrorCallbacks((error: any) => {
      console.error('PrintService: Error de QZ Tray:', error);
      this.updateStatus('error');
    });

    // Closed callback
    window.qz.websocket.setClosedCallbacks(() => {
      console.warn('PrintService: Conexión con QZ Tray cerrada');
      this.updateStatus('disconnected');
    });
    
    // Open callback
    window.qz.websocket.setOpenCallbacks(() => {
      console.log('PrintService: Conexión con QZ Tray abierta con éxito');
      this.updateStatus('connected');
      this.connectionAttempts = 0; // Reset connection attempts on success
    });
  }

  // Update connection status and notify listeners
  private updateStatus(status: PrinterConnectionStatus) {
    console.log(`PrintService: Actualizando estado de ${this.connectionStatus} a ${status}`);
    this.connectionStatus = status;
    // Notify all registered callbacks
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('PrintService: Error al ejecutar callback de estado:', error);
      }
    });
  }

  // Connect to QZ Tray
  public async connect(): Promise<boolean> {
    console.log('PrintService: Verificando disponibilidad de QZ Tray...');
    
    // Verificamos primero si QZ está ya disponible o si podemos esperar a que esté disponible
    const qzAvailable = await this.isQzAvailable();
    if (!qzAvailable) {
      console.error('PrintService: QZ Tray no está disponible en el navegador');
      this.updateStatus('error');
      toast.error("No se pudo conectar al sistema de impresión", {
        description: "QZ Tray no está instalado o no está en ejecución",
        duration: 5000,
      });
      return false;
    }
    
    if (!window.qz.websocket) {
      console.error('PrintService: El objeto QZ Tray no tiene la propiedad websocket');
      this.updateStatus('error');
      return false;
    }

    console.log('PrintService: Intentando conectar a QZ Tray. Intento #', ++this.connectionAttempts);
    
    // Si ya está conectado, no hacer nada
    if (window.qz.websocket.isActive()) {
      console.log('PrintService: Ya conectado a QZ Tray');
      this.updateStatus('connected');
      return true;
    }
    
    // Si se han superado los intentos máximos, esperar antes de intentar de nuevo
    if (this.connectionAttempts > this.maxConnectionAttempts) {
      console.log('PrintService: Demasiados intentos de conexión, esperando antes de reintentar');
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar 1 segundo
      this.connectionAttempts = 1; // Reiniciar contador después de esperar
    }

    try {
      this.updateStatus('connecting');
      
      // Connect to QZ Tray
      console.log('PrintService: Estableciendo conexión WebSocket');
      await window.qz.websocket.connect({
        retries: 2,
        delay: 1
      });
      
      // Get list of available printers after successful connection
      console.log('PrintService: Conexión establecida, obteniendo impresoras');
      await this.refreshPrinters();

      this.updateStatus('connected');
      toast.success("Conectado al sistema de impresión QZ Tray");
      return true;
    } catch (error) {
      console.error('PrintService: Error al conectar con QZ Tray:', error);
      this.updateStatus('error');
      toast.error("Error al conectar con QZ Tray", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
      return false;
    }
  }

  // Refresh the list of available printers
  public async refreshPrinters(): Promise<boolean> {
    console.log('PrintService: Iniciando actualización de impresoras...');
    
    // Verificar si QZ está disponible
    const qzAvailable = await this.isQzAvailable();
    if (!qzAvailable) {
      console.error('PrintService: QZ Tray no disponible para buscar impresoras');
      toast.error("No se pudo buscar impresoras", {
        description: "QZ Tray no está instalado o no está en ejecución",
      });
      return false;
    }

    if (!window.qz.websocket.isActive()) {
      console.error('PrintService: No hay conexión activa para buscar impresoras');
      
      // Intentamos conectar primero
      console.log('PrintService: Intentando conectar antes de buscar impresoras');
      const connected = await this.connect();
      
      if (!connected) {
        toast.error("No se pudo buscar impresoras", {
          description: "No hay conexión activa con QZ Tray",
        });
        return false;
      }
    }

    try {
      console.log('PrintService: Buscando impresoras disponibles');
      // Get list of available printers
      const printers = await window.qz.printers.find();
      console.log('PrintService: Impresoras encontradas:', printers);
      
      this.availablePrinters = printers.map((name: string) => ({
        name,
        isDefault: false
      }));
      
      // Get default printer
      try {
        console.log('PrintService: Obteniendo impresora predeterminada');
        const defaultPrinter = await window.qz.printers.getDefault();
        console.log('PrintService: Impresora predeterminada:', defaultPrinter);
        
        if (defaultPrinter) {
          this.defaultPrinter = defaultPrinter;
          this.availablePrinters = this.availablePrinters.map(printer => ({
            ...printer,
            isDefault: printer.name === defaultPrinter
          }));
        }
      } catch (defPrinterError) {
        console.error('PrintService: Error al obtener impresora predeterminada:', defPrinterError);
        // No hacer fallar toda la operación por esto
      }

      // Notificar al usuario del resultado
      if (this.availablePrinters.length > 0) {
        toast.success(`Se encontraron ${this.availablePrinters.length} impresoras`);
      } else {
        toast.info("No se encontraron impresoras instaladas", {
          description: "Verifica que tengas impresoras configuradas en tu sistema",
        });
      }

      return true;
    } catch (error) {
      console.error('PrintService: Error al refrescar impresoras:', error);
      toast.error("Error al buscar impresoras", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
      return false;
    }
  }

  // Disconnect from QZ Tray
  public async disconnect(): Promise<boolean> {
    console.log('PrintService: Iniciando proceso de desconexión...');
    
    if (!window.qz) {
      console.log('PrintService: QZ Tray no disponible para desconectar');
      this.updateStatus('disconnected');
      return false;
    }

    if (!window.qz.websocket.isActive()) {
      console.log('PrintService: No hay una conexión activa que desconectar');
      this.updateStatus('disconnected');
      return false;
    }

    try {
      console.log('PrintService: Desconectando de QZ Tray');
      await window.qz.websocket.disconnect();
      this.updateStatus('disconnected');
      toast.info("Desconectado del sistema de impresión");
      return true;
    } catch (error) {
      console.error('PrintService: Error al desconectar de QZ Tray:', error);
      toast.error("Error al desconectar del sistema de impresión");
      return false;
    }
  }

  // Check if connected to QZ Tray
  public isConnected(): boolean {
    return window.qz && window.qz.websocket && window.qz.websocket.isActive();
  }

  // Get connection status
  public getConnectionStatus(): PrinterConnectionStatus {
    return this.connectionStatus;
  }

  // Get available printers
  public getAvailablePrinters(): PrinterConfig[] {
    return this.availablePrinters;
  }

  // Get default printer
  public getDefaultPrinter(): string | null {
    return this.defaultPrinter;
  }

  // Register status change callback
  public onStatusChange(callback: (status: PrinterConnectionStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    
    // Return function to unregister callback
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
    };
  }
}

// Create singleton instance
const printService = new PrintService();

export default printService;

// Re-export types with the correct syntax for isolated modules
export type { PrinterConnectionStatus, PrinterConfig };
