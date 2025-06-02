
import { useState, useEffect } from 'react';

export const useMenuFormDialog = (onClose: (saved: boolean) => void) => {
  const [isOpen, setIsOpen] = useState(true);
  const [shouldClose, setShouldClose] = useState(false);

  const handleClose = (saved: boolean = false) => {
    console.log('🔄 Dialog handleClose called with saved:', saved);
    
    // Force immediate close
    setIsOpen(false);
    setShouldClose(true);
    
    // Call parent callback immediately
    onClose(saved);
  };

  // Force dialog to close immediately when shouldClose is true
  useEffect(() => {
    if (shouldClose) {
      console.log('🔄 Forcing dialog close due to shouldClose flag');
      setIsOpen(false);
    }
  }, [shouldClose]);

  return {
    isOpen,
    handleClose,
    setIsOpen,
  };
};
