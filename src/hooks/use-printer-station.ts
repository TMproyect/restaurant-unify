
import { useEffect, useState } from 'react';
import printerStationService from '@/services/printing/stationService';
import { PrinterStation } from '@/services/printing/types';

/**
 * Hook for accessing printer stations
 */
export function usePrinterStation() {
  const [stations, setStations] = useState<PrinterStation[]>([]);
  
  // Load stations on mount
  useEffect(() => {
    const loadedStations = printerStationService.getStations();
    setStations(loadedStations);
  }, []);
  
  /**
   * Get printer name for a specific station
   */
  const getPrinterForStation = (stationId: string): string | null => {
    return printerStationService.getPrinterForStation(stationId);
  };
  
  return {
    stations,
    getPrinterForStation,
  };
}

export default usePrinterStation;
