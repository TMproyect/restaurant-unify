
import { useState } from 'react';

export const useMenuFormDialog = (onClose: (saved: boolean) => void) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose(false);
  };

  return {
    isOpen,
    handleClose,
    setIsOpen,
  };
};
