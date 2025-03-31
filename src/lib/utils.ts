
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency with the given locale and currency code
 * @param amount - The amount to format
 * @param locale - The locale to use (defaults to 'es-MX')
 * @param currency - The currency code (defaults to 'MXN')
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  locale: string = 'es-MX', 
  currency: string = 'MXN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
