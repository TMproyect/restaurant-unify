
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DeliveryFormModal from "./DeliveryFormModal";

interface DeliveryHeaderProps {
  onDeliveryCreated?: () => void;
}

const DeliveryHeader = ({ onDeliveryCreated }: DeliveryHeaderProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDeliveryCreated = () => {
    if (onDeliveryCreated) {
      onDeliveryCreated();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Entregas</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus size={18} className="mr-2" /> Nueva Entrega
        </Button>
      </div>

      <DeliveryFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleDeliveryCreated}
      />
    </>
  );
};

export default DeliveryHeader;
