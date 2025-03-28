
/**
 * Utility for getting environment variables with better error handling
 */

/**
 * Gets environment variables with improved error handling
 * @param keys Array of environment variable keys to retrieve
 * @param defaults Optional default values for keys
 * @returns Object containing the environment variables
 */
export function getEnv(keys: string[], defaults: Record<string, string> = {}) {
  const env: Record<string, string> = {};

  for (const key of keys) {
    const value = Deno.env.get(key);
    
    if (!value) {
      console.warn(`Environment variable ${key} is not set`);
      
      // Use default if available
      if (key in defaults) {
        env[key] = defaults[key];
      } else {
        throw new Error(`Required environment variable ${key} is missing`);
      }
    } else {
      env[key] = value;
    }
  }

  return env;
}
