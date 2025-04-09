
// This file contains utility functions that don't directly interact with Supabase
// or are general-purpose helpers for authentication

// Add any additional utility functions here as needed
export const parseAuthError = (error: any): string => {
  if (!error) return 'Unknown error';
  
  if (typeof error === 'string') return error;
  
  if (error.message) return error.message;
  
  if (error.error_description) return error.error_description;
  
  return JSON.stringify(error);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
