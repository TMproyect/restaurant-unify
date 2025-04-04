
import { PrinterStation, PrinterStationConfig } from './types';

// Local storage key for printer stations
const PRINTER_STATIONS_KEY = 'restaurant_printer_stations';

// Default stations that should always exist
const DEFAULT_STATIONS: PrinterStation[] = [
  {
    id: 'cashier',
    name: 'Caja',
    description: 'Impresora para pre-cuentas y tickets de pago',
    printerName: null
  },
  {
    id: 'kitchen',
    name: 'Cocina',
    description: 'Impresora para comandas de cocina',
    printerName: null
  },
  {
    id: 'bar',
    name: 'Barra',
    description: 'Impresora para comandas de bebidas',
    printerName: null
  },
  {
    id: 'general',
    name: 'General',
    description: 'Impresora para comandas generales',
    printerName: null
  }
];

/**
 * Service for managing printer stations
 */
export class PrinterStationService {
  private stations: PrinterStation[] = [];
  
  constructor() {
    this.loadStations();
  }
  
  /**
   * Load stations from local storage or use defaults
   */
  private loadStations(): void {
    try {
      const savedStations = localStorage.getItem(PRINTER_STATIONS_KEY);
      
      if (savedStations) {
        const parsedStations = JSON.parse(savedStations);
        this.stations = parsedStations.stations || DEFAULT_STATIONS;
      } else {
        // If no stations are saved, use defaults
        this.stations = [...DEFAULT_STATIONS];
        this.saveStations();
      }
      
      console.log('Printer stations loaded:', this.stations);
    } catch (error) {
      console.error('Error loading printer stations:', error);
      this.stations = [...DEFAULT_STATIONS];
    }
  }
  
  /**
   * Save stations to local storage
   */
  private saveStations(): void {
    try {
      const stationsConfig: PrinterStationConfig = {
        stations: this.stations
      };
      
      localStorage.setItem(PRINTER_STATIONS_KEY, JSON.stringify(stationsConfig));
      console.log('Printer stations saved to local storage');
    } catch (error) {
      console.error('Error saving printer stations:', error);
    }
  }
  
  /**
   * Get all printer stations
   */
  public getStations(): PrinterStation[] {
    return this.stations;
  }
  
  /**
   * Get a specific station by ID
   */
  public getStation(id: string): PrinterStation | undefined {
    return this.stations.find(station => station.id === id);
  }
  
  /**
   * Get printer name for a specific station
   */
  public getPrinterForStation(stationId: string): string | null {
    const station = this.getStation(stationId);
    return station?.printerName || null;
  }
  
  /**
   * Add a new station
   */
  public addStation(station: Omit<PrinterStation, 'id'>): PrinterStation {
    const id = `station_${Date.now()}`;
    const newStation: PrinterStation = {
      ...station,
      id
    };
    
    this.stations.push(newStation);
    this.saveStations();
    
    return newStation;
  }
  
  /**
   * Update an existing station
   */
  public updateStation(id: string, updates: Partial<Omit<PrinterStation, 'id'>>): PrinterStation | null {
    const index = this.stations.findIndex(station => station.id === id);
    
    if (index === -1) {
      return null;
    }
    
    this.stations[index] = {
      ...this.stations[index],
      ...updates
    };
    
    this.saveStations();
    return this.stations[index];
  }
  
  /**
   * Delete a station
   */
  public deleteStation(id: string): boolean {
    // Don't allow deleting default stations
    const isDefaultStation = DEFAULT_STATIONS.some(station => station.id === id);
    if (isDefaultStation) {
      return false;
    }
    
    const initialLength = this.stations.length;
    this.stations = this.stations.filter(station => station.id !== id);
    
    if (this.stations.length !== initialLength) {
      this.saveStations();
      return true;
    }
    
    return false;
  }
  
  /**
   * Assign a printer to a station
   */
  public assignPrinter(stationId: string, printerName: string | null): boolean {
    const station = this.getStation(stationId);
    
    if (!station) {
      return false;
    }
    
    station.printerName = printerName;
    this.saveStations();
    
    return true;
  }
}

// Create a singleton instance
const printerStationService = new PrinterStationService();

export default printerStationService;
