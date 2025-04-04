
/// <reference types="vite/client" />

// Add printService to Window interface
interface Window {
  qz?: any;
  qzScriptLoaded?: boolean;
  printService: {
    printRaw: (printerName: string, data: string, options?: { encoding?: string; language?: string }) => Promise<boolean>;
  };
}
