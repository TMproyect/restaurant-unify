
import React from 'react';
import { 
  ChefHat, 
  Truck,
  Users,
  Store 
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type RecipientOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
};

interface RecipientSelectorProps {
  selectedRecipient: string;
  setSelectedRecipient: (id: string) => void;
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  selectedRecipient,
  setSelectedRecipient
}) => {
  const recipientOptions: RecipientOption[] = [
    {
      id: 'kitchen',
      name: 'Cocina',
      icon: <ChefHat className="h-4 w-4 text-orange-500" />,
      description: 'Notificar al personal de cocina'
    },
    {
      id: 'manager',
      name: 'Gerencia',
      icon: <Users className="h-4 w-4 text-purple-500" />,
      description: 'Informar a gerencia sobre la cancelación'
    },
    {
      id: 'delivery',
      name: 'Delivery',
      icon: <Truck className="h-4 w-4 text-blue-500" />,
      description: 'Notificar al equipo de delivery'
    },
    {
      id: 'store',
      name: 'Tienda',
      icon: <Store className="h-4 w-4 text-gray-500" />,
      description: 'Enviar mensaje al personal de tienda'
    },
    {
      id: 'all',
      name: 'Todos',
      icon: <Users className="h-4 w-4 text-gray-700" />,
      description: 'Enviar mensaje a todas las áreas'
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Seleccionar destinatario</h3>
      <RadioGroup
        value={selectedRecipient}
        onValueChange={setSelectedRecipient}
        className="space-y-2"
      >
        {recipientOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted">
            <RadioGroupItem value={option.id} id={`recipient-${option.id}`} />
            <Label htmlFor={`recipient-${option.id}`} className="flex flex-1 items-center cursor-pointer">
              <div className="flex items-center space-x-2">
                {option.icon}
                <span className="font-medium">{option.name}</span>
              </div>
              <span className="ml-auto text-xs text-muted-foreground">{option.description}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default RecipientSelector;
