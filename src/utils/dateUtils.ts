
/**
 * Utility functions for formatting and handling dates
 */

/**
 * Format a number of minutes into a human-readable relative time string
 * @param minutes The number of minutes elapsed
 * @returns A formatted string like "5m", "2h 15m", etc.
 */
export function formatRelativeTime(minutes: number): string {
  if (minutes < 0) {
    return "0m";
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format a date to a localized time string in 12-hour format
 * @param date The date to format
 * @returns A formatted time string with AM/PM
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString('es-ES', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get a relative time description (like "just now", "5 minutes ago", etc.)
 * @param date The date to compare against current time
 * @returns A human-readable relative time description
 */
export function getRelativeTimeDescription(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) {
    return "ahora mismo";
  }
  if (diffMinutes < 60) {
    return `hace ${diffMinutes} minuto${diffMinutes === 1 ? '' : 's'}`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays} día${diffDays === 1 ? '' : 's'}`;
}
