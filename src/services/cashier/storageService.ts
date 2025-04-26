
import { CashRegisterShift } from "./types";

const STORAGE_KEY = 'active_shift';

/**
 * Loads the active shift from local storage
 * @returns CashRegisterShift or null if no active shift is found
 */
export const loadActiveShiftFromStorage = (): CashRegisterShift | null => {
  try {
    console.log("[storageService] Attempting to load active shift from storage");
    const storedShift = localStorage.getItem(STORAGE_KEY);
    
    if (!storedShift) {
      console.log("[storageService] No shift found in storage");
      return null;
    }
    
    const shift = JSON.parse(storedShift);
    if (!shift || shift.status !== 'open') {
      console.log("[storageService] Found shift but it's not active:", shift);
      return null;
    }
    
    console.log("[storageService] Found active shift in storage:", shift);
    return shift;
  } catch (error) {
    console.error('[storageService] Error parsing stored shift:', error);
    // Clean up corrupted data
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

/**
 * Saves a shift to local storage
 * @param shift The shift to save
 */
export const saveShiftToStorage = (shift: CashRegisterShift): void => {
  try {
    console.log("[storageService] Saving shift to storage:", shift);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shift));
  } catch (error) {
    console.error('[storageService] Error saving shift to storage:', error);
  }
};

/**
 * Removes the active shift from local storage
 */
export const removeShiftFromStorage = (): void => {
  try {
    console.log("[storageService] Removing shift from storage");
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[storageService] Error removing shift from storage:', error);
  }
};
