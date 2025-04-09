
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeliveryForm from "./DeliveryForm";

interface DeliveryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DeliveryFormModal: React.FC<DeliveryFormModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Entrega</DialogTitle>
        </DialogHeader>
        <DeliveryForm 
          onSuccess={handleSuccess} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryFormModal;
