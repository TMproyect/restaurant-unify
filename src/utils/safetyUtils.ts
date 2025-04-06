
/**
 * Safe check utility functions to avoid runtime errors
 */

/**
 * Safely gets a property from an object, returning a default value if the property is undefined
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K, defaultValue: T[K]): T[K] {
  if (obj === null || obj === undefined) {
    console.log(`⚠️ [safeGet] Object is null or undefined when accessing ${String(key)}`);
    return defaultValue;
  }
  
  const value = obj[key];
  if (value === undefined) {
    console.log(`⚠️ [safeGet] Property ${String(key)} is undefined, using default value`);
    return defaultValue;
  }
  
  return value;
}

/**
 * Checks if an array is valid (not null, not undefined, and has elements)
 */
export function isValidArray<T>(arr: T[] | null | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Safely gets an array, returning an empty array if the input is null or undefined
 */
export function safeArray<T>(arr: T[] | null | undefined): T[] {
  if (!Array.isArray(arr)) {
    console.log(`⚠️ [safeArray] Input is not an array, returning empty array`);
    return [];
  }
  
  return arr;
}

/**
 * Safely execute a function, returning a default value if an error occurs
 */
export function safeExecute<T>(fn: () => T, defaultValue: T): T {
  try {
    return fn();
  } catch (error) {
    console.error(`❌ [safeExecute] Error executing function:`, error);
    return defaultValue;
  }
}
