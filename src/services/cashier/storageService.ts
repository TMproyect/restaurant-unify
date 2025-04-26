
import { CashRegisterShift } from "./types";

const STORAGE_KEY = 'active_shift';

/**
 * Loads the active shift from local storage
 * @returns CashRegisterShift or null if no active shift is found
 */
export const loadActiveShiftFromStorage = (): CashRegisterShift | null => {
  try {
    const storedShift = localStorage.getItem(STORAGE_KEY);
    
    if (!storedShift) {
      return null;
    }
    
    const shift = JSON.parse(storedShift);
    
    if (!shift || shift.status !== 'open') {
      return null;
    }
    
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
    if (!shift || !shift.id || !shift.user_id) {
      console.error("[storageService] Cannot save invalid shift:", shift);
      return;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shift));
  } catch (error) {
    console.error('[storageService] Error saving shift to storage:', error);
  }
};

/**
 * Removes the active shift from local storage
 */
export const removeShiftFromStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
