
import { useState } from 'react';

export const useMenuFormDialog = (onClose: (saved: boolean) => void) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = (saved: boolean = false) => {
    console.log('🔄 Dialog: Closing with saved =', saved);
    
    // Cerrar inmediatamente
    setIsOpen(false);
    
    // Llamar al callback del padre
    onClose(saved);
  };

  return {
    isOpen,
    handleClose,
    setIsOpen,
  };
};
