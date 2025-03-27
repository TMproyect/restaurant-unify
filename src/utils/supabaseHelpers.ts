
/**
 * Helper functions for safely handling Supabase responses and properly typing them
 */

// Use this for single item responses
export function mapSingleResponse<T, R = any>(data: R | null, errorMessage: string): T | null {
  if (!data) {
    console.error(errorMessage);
    return null;
  }
  
  // Check if data has an error property
  if (typeof data === 'object' && data !== null && 'error' in data && data.error) {
    console.error(errorMessage, data.error);
    return null;
  }
  
  return data as unknown as T;
}

// Use this for array responses
export function mapArrayResponse<T, R = any>(data: R[] | null, errorMessage: string): T[] {
  if (!data) {
    console.error(errorMessage);
    return [];
  }
  
  // Check if data has an error property
  if (typeof data === 'object' && data !== null && 'error' in data && data.error) {
    console.error(errorMessage, data.error);
    return [];
  }
  
  return data as unknown as T[];
}

// Helper function to check if Supabase response has an error
export function hasResponseError(response: { error: any }): boolean {
  return !!response.error;
}

// Safe function to check if an object has a property
export function hasProperty<T extends object, K extends PropertyKey>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

// Type guard for handling array vs. object types from Supabase
export function isArray<T>(data: any): data is T[] {
  return Array.isArray(data);
}

// Helper to safely insert data using typed objects
export function prepareInsertData<T>(data: Partial<T>): Record<string, any> {
  // Filter out undefined values
  return Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {} as Record<string, any>);
}

// Process a Supabase query response by extracting data or returning an empty array
export function processQueryResult<T>(response: { data: any; error: any }, errorPrefix: string = "Query error"): T[] {
  if (response.error) {
    console.error(`${errorPrefix}:`, response.error);
    return [];
  }
  
  if (!response.data) {
    return [];
  }
  
  return response.data as T[];
}

// Process a single item Supabase query response
export function processSingleResult<T>(response: { data: any; error: any }, errorPrefix: string = "Query error"): T | null {
  if (response.error) {
    console.error(`${errorPrefix}:`, response.error);
    return null;
  }
  
  if (!response.data) {
    return null;
  }
  
  return response.data as T;
}

// Type casting for filters
export function filterValue<T>(value: T): T {
  return value; // This bypasses type issues with filter parameters
}

// Helper function to safely check for properties on possibly error objects
export function safetyCheck<T, K extends keyof T>(obj: any, property: K, fallback: T[K]): T[K] {
  if (obj && 
      typeof obj === 'object' && 
      !('error' in obj) && 
      property in obj) {
    return obj[property as string] as T[K];
  }
  return fallback;
}

// Alternative implementation of filterValue for boolean specifically
export function filterBooleanValue(value: boolean): any {
  return value as any; // Cast to any to bypass type checking for boolean filters
}
