
import { toast } from "sonner";
import { isQzScriptLoaded, loadQzScript, waitForQZ } from '../qzDetection';
import type { PrinterConnectionStatus } from '../types';

export class InitializationService {
  private isReady = false;
  private qzCheckInterval: number | null = null;

  private initialize(): void {
    console.log("🖨️ PrintService: Initializing printing service");
    
    if (typeof window !== 'undefined') {
      console.log("🖨️ PrintService: Setting up event listeners for QZ Tray");
      
      this.checkQzAvailability();
      
      window.addEventListener('qz-tray-available', (event: CustomEvent) => {
        console.log("🖨️ PrintService: QZ-TRAY-AVAILABLE event received");
        if (this.isReady) return;
        this.setupService();
      });
      
      this.qzCheckInterval = window.setInterval(() => {
        this.checkQzAvailability();
      }, 3000);
      
      setTimeout(() => {
        if (this.qzCheckInterval !== null) {
          window.clearInterval(this.qzCheckInterval);
          this.qzCheckInterval = null;
        }
      }, 30000);
    }
  }

  private checkQzAvailability(): void {
    if (this.isReady) return;
    
    if (this.connectionStatus !== 'disconnected') {
      console.debug("🖨️ PrintService: Checking QZ Tray availability");
    } else {
      console.log("🖨️ PrintService: Checking QZ Tray availability");
    }
    
    if (window.qz) {
      console.log("🖨️ PrintService: QZ Tray detected in periodic check");
      if (!this.isReady) {
        this.setupService();
      }
      
      if (this.qzCheckInterval !== null) {
        window.clearInterval(this.qzCheckInterval);
        this.qzCheckInterval = null;
      }
    } else {
      console.debug("🖨️ PrintService: QZ Tray not available in this check");
    }
  }

  async isQzAvailable(): Promise<boolean> {
    console.log("🖨️ PrintService: Verifying QZ Tray availability");
    
    if (window.qz) {
      console.log("🖨️ PrintService: QZ Tray is already available");
      if (!this.isReady) {
        this.setupService();
      }
      return true;
    }
    
    if (!isQzScriptLoaded()) {
      try {
        await loadQzScript();
      } catch (err) {
        console.error("🖨️ PrintService: Error adding script dynamically", err);
        this.updateStatus('not-installed');
        return false;
      }
    }
    
    try {
      await waitForQZ();
      if (!this.isReady) {
        this.setupService();
      }
      return true;
    } catch (error) {
      console.error("🖨️ PrintService: Error waiting for QZ Tray:", error);
      this.updateStatus('not-installed');
      return false;
    }
  }

  private setupService(): void {
    this.isReady = true;
    console.log('PrintService: QZ Tray service initialized');
  }

  constructor(
    private updateStatus: (status: PrinterConnectionStatus) => void,
    private connectionStatus: PrinterConnectionStatus
  ) {
    this.initialize();
  }
}
