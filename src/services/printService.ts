
// QZ Tray service for handling printer connections
import { toast } from "sonner";

// Define the global qz object
declare global {
  interface Window {
    qz: any;
  }
}

// Connection status type
export type PrinterConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// Printer configuration type
export interface PrinterConfig {
  name: string;
  isDefault: boolean;
}

class PrintService {
  private isReady = false;
  private connectionStatus: PrinterConnectionStatus = 'disconnected';
  private availablePrinters: PrinterConfig[] = [];
  private defaultPrinter: string | null = null;
  private statusCallbacks: ((status: PrinterConnectionStatus) => void)[] = [];
  private scriptLoaded = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private qzCheckInterval: number | null = null;
  private qzLoadAttempts = 0;
  private maxQzLoadAttempts = 5;

  constructor() {
    // Initialize when the service is created
    this.initialize();
  }

  // Initialize the service and QZ Tray
  private initialize() {
    console.log("PrintService: Inicializando servicio");
    
    // Verificar si QZ Tray ya está disponible
    if (typeof window !== 'undefined') {
      console.log("PrintService: Comprobando disponibilidad de QZ Tray");
      
      // Primera comprobación inicial
      this.checkQzAvailability();
      
      // Configurar un intervalo para comprobar periódicamente si QZ Tray está disponible
      // (útil si el usuario inicia QZ Tray después de cargar la página)
      this.qzCheckInterval = window.setInterval(() => {
        this.checkQzAvailability();
      }, 3000); // Comprobar cada 3 segundos
    }
  }

  // Comprobar si QZ Tray está disponible
  private checkQzAvailability() {
    if (window.qz) {
      console.log("PrintService: QZ Tray detectado en verificación periódica");
      
      // Si ya estamos listos, no hacer nada
      if (this.isReady) {
        return;
      }

      // Detener el intervalo de comprobación si QZ Tray está disponible
      if (this.qzCheckInterval) {
        console.log("PrintService: Deteniendo comprobación periódica de QZ Tray");
        window.clearInterval(this.qzCheckInterval);
        this.qzCheckInterval = null;
      }

      this.setupService();
    } else {
      console.log("PrintService: QZ Tray no disponible en esta comprobación");
    }
  }

  // Asegurarse de que QZ Tray esté cargado, con reintentos
  public async ensureQzTrayLoaded(): Promise<boolean> {
    console.log("PrintService: Asegurando que QZ Tray esté cargado");
    
    // Si QZ Tray ya está disponible, devolvemos true inmediatamente
    if (window.qz) {
      console.log("PrintService: QZ Tray ya está disponible");
      
      // Configurar el servicio si aún no está listo
      if (!this.isReady) {
        this.setupService();
      }
      
      return true;
    }
    
    // Si hemos alcanzado el número máximo de intentos, fallamos
    if (this.qzLoadAttempts >= this.maxQzLoadAttempts) {
      console.error("PrintService: Número máximo de intentos de carga de QZ Tray alcanzado");
      return false;
    }
    
    // Incrementar contador de intentos
    this.qzLoadAttempts++;
    
    console.log(`PrintService: Intento ${this.qzLoadAttempts} de cargar QZ Tray`);
    
    try {
      // Intentar cargar QZ Tray dinámicamente si no está disponible
      if (!window.qz) {
        await this.loadQzTrayScript();
      }
      
      // Esperar a que QZ Tray esté disponible
      await this.waitForQZ();
      
      console.log("PrintService: QZ Tray cargado con éxito");
      
      if (!this.isReady) {
        this.setupService();
      }
      
      return true;
    } catch (error) {
      console.error("PrintService: Error al cargar QZ Tray:", error);
      
      // Si todavía tenemos intentos disponibles, intentamos de nuevo después de un breve retraso
      if (this.qzLoadAttempts < this.maxQzLoadAttempts) {
        console.log(`PrintService: Reintentando cargar QZ Tray en 1 segundo (intento ${this.qzLoadAttempts}/${this.maxQzLoadAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.ensureQzTrayLoaded(); // Recursión para reintentar
      }
      
      return false;
    }
  }
  
  // Cargar el script QZ Tray dinámicamente
  private loadQzTrayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded || window.qz) {
        resolve();
        return;
      }
      
      console.log("PrintService: Cargando QZ Tray script dinámicamente");
      
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qz-tray/2.2.1/qz-tray.js";
      script.integrity = "sha512-2G1ZyqmP1rpnCxAzKRO7kLxwAzXUQYFU3eVtVVG1sOgx9QKCChvVvhCN4Rg4FbHQ+6S4V4qLOeE9ZYaNwpUCdA==";
      script.crossOrigin = "anonymous";
      script.referrerPolicy = "no-referrer";
      
      script.onload = () => {
        console.log("PrintService: Script de QZ Tray cargado con éxito");
        this.scriptLoaded = true;
        resolve();
      };
      
      script.onerror = (error) => {
        console.error("PrintService: Error al cargar el script de QZ Tray:", error);
        reject(new Error("No se pudo cargar el script de QZ Tray"));
      };
      
      document.head.appendChild(script);
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

  // Wait for QZ to be available
  private waitForQZ(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.qz) {
        console.log("PrintService: QZ Tray detectado inmediatamente");
        resolve();
        return;
      }

      console.log("PrintService: Esperando a QZ Tray...");

      // Check every 500ms for 10 seconds (20 attempts)
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.qz) {
          console.log(`PrintService: QZ Tray detectado después de ${attempts * 0.5} segundos`);
          clearInterval(interval);
          resolve();
          return;
        }

        attempts++;
        if (attempts >= 20) {
          console.log("PrintService: QZ Tray no disponible después de 10 segundos");
          clearInterval(interval);
          reject(new Error('QZ Tray no disponible después de 10 segundos'));
        }
      }, 500);
    });
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

  // Check if QZ Tray is available in the browser
  public async isQzAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') {
      console.log("PrintService: No estamos en un entorno de navegador");
      return false;
    }
    
    // Si QZ ya está disponible, devolvemos true inmediatamente
    if (window.qz) {
      return true;
    }
    
    // Si no está disponible, intentamos cargarlo
    try {
      return await this.ensureQzTrayLoaded();
    } catch (error) {
      console.error("PrintService: Error al verificar disponibilidad de QZ Tray:", error);
      return false;
    }
  }

  // Connect to QZ Tray
  public async connect(): Promise<boolean> {
    console.log('PrintService: Verificando disponibilidad de QZ Tray...');
    
    // Verificamos primero si QZ está ya disponible o si podemos cargarlo dinámicamente
    const qzAvailable = await this.ensureQzTrayLoaded();
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
