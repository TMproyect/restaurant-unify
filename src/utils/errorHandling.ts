
import { toast } from 'sonner';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown, context?: string): void => {
  console.error(`❌ [${context || 'App'}] Error:`, error);
  
  if (error instanceof AppError) {
    toast.error(error.message);
  } else {
    toast.error('Ha ocurrido un error inesperado');
  }
};

export const createServiceError = (message: string, code?: string, context?: any): AppError => {
  return new AppError(message, code, context);
};

