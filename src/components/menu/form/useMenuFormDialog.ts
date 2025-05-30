
import { useState, useEffect } from 'react';

export const useMenuFormDialog = (onClose: (saved: boolean) => void) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = (saved: boolean = false) => {
    console.log('🔄 Dialog closing with saved:', saved);
    setIsOpen(false);
    
    // Small delay to allow dialog animation
    setTimeout(() => {
      onClose(saved);
    }, 100);
  };

  // Close dialog when component unmounts
  useEffect(() => {
    return () => {
      console.log('🔄 Dialog unmounting');
    };
  }, []);

  return {
    isOpen,
    handleClose,
    setIsOpen,
  };
};
