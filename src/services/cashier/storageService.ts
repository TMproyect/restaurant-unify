
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
    console.log("[storageService] Shift parsed:", shift);
    
    if (!shift || shift.status !== 'open') {
      console.log("[storageService] Shift is not active:", shift?.status);
      return null;
    }
    
    console.log("[storageService] Active shift loaded successfully:", shift.id);
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
    console.log("[storageService] Saving shift to storage:", shift.id);
    
    if (!shift || !shift.id || !shift.user_id) {
      console.error("[storageService] Cannot save invalid shift:", shift);
      return;
    }
    
    // Stringify ahead of time to catch any serialization errors
    const shiftData = JSON.stringify(shift);
    localStorage.setItem(STORAGE_KEY, shiftData);
    
    console.log("[storageService] Shift saved successfully:", shift.id);
    
    // Verify storage was successful
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (!saved) {
      console.error("[storageService] Verification failed - shift not saved!");
    } else {
      console.log("[storageService] Verification completed - shift saved successfully");
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
    
    localStorage.removeItem(STORAGE_KEY);
    
    console.log("[storageService] Shift removed from storage");
    
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
