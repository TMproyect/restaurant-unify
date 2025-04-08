
/**
 * Formats a number as currency
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: es-ES)
 * @param currency - The currency to use (default: EUR)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number, 
  locale: string = 'es-ES', 
  currency: string = 'EUR'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formats a date string or Date object
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: es-ES)
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date, 
  locale: string = 'es-ES'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Formats a datetime string or Date object
 * @param date - The datetime to format
 * @param locale - The locale to use for formatting (default: es-ES)
 * @returns Formatted datetime string
 */
export const formatDateTime = (
  date: string | Date, 
  locale: string = 'es-ES'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Formats a number
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: es-ES)
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number, 
  locale: string = 'es-ES'
): string => {
  return new Intl.NumberFormat(locale).format(value);
};
