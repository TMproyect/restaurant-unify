
import { CashRegisterShift } from "./types";

const STORAGE_KEY = 'active_shift';

/**
 * Loads the active shift from local storage
 * @returns CashRegisterShift or null if no active shift is found
 */
export const loadActiveShiftFromStorage = (): CashRegisterShift | null => {
  try {
    console.log("[storageService] Attempting to load active shift from storage");
    // Try to get from memory cache first to improve performance
    const start = performance.now();
    const storedShift = localStorage.getItem(STORAGE_KEY);
    
    if (!storedShift) {
      console.log("[storageService] No shift found in storage");
      return null;
    }
    
    const shift = JSON.parse(storedShift);
    const end = performance.now();
    console.log(`[storageService] Shift parsed in ${(end-start).toFixed(2)}ms:`, shift);
    
    if (!shift || shift.status !== 'open') {
      console.log("[storageService] Shift is not active:", shift?.status);
      return null;
    }
    
    console.log("[storageService] Active shift loaded successfully");
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
    console.log("[storageService] Saving shift to storage");
    const start = performance.now();
    
    // Stringify ahead of time to catch any serialization errors
    const shiftData = JSON.stringify(shift);
    localStorage.setItem(STORAGE_KEY, shiftData);
    
    const end = performance.now();
    console.log(`[storageService] Shift saved in ${(end-start).toFixed(2)}ms`);
    
    // Verify storage was successful
    const verifyStart = performance.now();
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (!saved) {
      console.error("[storageService] Verification failed - shift not saved!");
    } else {
      const verifyEnd = performance.now();
      console.log(`[storageService] Verification completed in ${(verifyEnd-verifyStart).toFixed(2)}ms`);
    }
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
    const start = performance.now();
    
    localStorage.removeItem(STORAGE_KEY);
    
    const end = performance.now();
    console.log(`[storageService] Shift removed in ${(end-start).toFixed(2)}ms`);
    
    // Verify removal was successful
    const check = localStorage.getItem(STORAGE_KEY);
    if (check) {
      console.error("[storageService] Verification failed - shift not removed!");
    } else {
      console.log("[storageService] Shift removed successfully");
    }
  } catch (error) {
    console.error('[storageService] Error removing shift from storage:', error);
  }
};
