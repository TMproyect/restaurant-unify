
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const DeliveryHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Entregas</h1>
      <Button>
        <Plus size={18} className="mr-2" /> Nueva Entrega
      </Button>
    </div>
  );
};

export default DeliveryHeader;
