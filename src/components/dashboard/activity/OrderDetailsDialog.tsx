
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Package, 
  DollarSign, 
  User, 
  MessageSquare,
  ChefHat,
  Truck,
  Store,
  Users
} from "lucide-react";
import StatusBadge from './StatusBadge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { toast } from 'sonner';
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface OrderDetailsDialogProps {
  order: ActivityMonitorItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (orderId: string, message: string, recipient: string) => void;
}

type RecipientOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
};

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  isOpen,
  onClose,
  onSendMessage
}) => {
  const [isMessageSheetOpen, setIsMessageSheetOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('kitchen');

  if (!order) return null;

  const recipientOptions: RecipientOption[] = [
    {
      id: 'kitchen',
      name: 'Cocina',
      icon: <ChefHat className="h-4 w-4 text-orange-500" />,
      description: 'Enviar mensaje al personal de cocina'
    },
    {
      id: 'delivery',
      name: 'Delivery',
      icon: <Truck className="h-4 w-4 text-blue-500" />,
      description: 'Enviar mensaje al equipo de delivery'
    },
    {
      id: 'customer',
      name: 'Cliente',
      icon: <User className="h-4 w-4 text-green-500" />,
      description: 'Enviar mensaje directamente al cliente'
    },
    {
      id: 'store',
      name: 'Tienda',
      icon: <Store className="h-4 w-4 text-purple-500" />,
      description: 'Enviar mensaje al personal de tienda'
    },
    {
      id: 'all',
      name: 'Todos',
      icon: <Users className="h-4 w-4 text-gray-500" />,
      description: 'Enviar mensaje a todas las áreas'
    }
  ];

  const handleSendMessage = () => {
    if (message.trim() && order) {
      if (onSendMessage) {
        onSendMessage(order.id, message, selectedRecipient);
      } else {
        toast.success(`Mensaje enviado a ${recipientOptions.find(r => r.id === selectedRecipient)?.name} para la orden ${order.id.substring(0, 6)}`);
      }
      setMessage('');
      setIsMessageSheetOpen(false);
    } else {
      toast.error("Por favor ingrese un mensaje");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Orden #{order.id.substring(0, 6)}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Customer and Status Information */}
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  <span>Cliente</span>
                </div>
                <div className="font-medium">{order.customer}</div>
              </div>
              
              <StatusBadge status={order.status} />
            </div>
            
            <Separator />
            
            {/* Order Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Hora de Pedido</span>
                </div>
                <div className="font-medium">
                  {new Date(order.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(order.timestamp).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Package className="h-4 w-4 mr-1" />
                  <span>Productos</span>
                </div>
                <div className="font-medium">{order.itemsCount} items</div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>Total</span>
                </div>
                <div className="font-medium">${order.total.toFixed(2)}</div>
              </div>
              
              {order.hasDiscount && (
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>Descuento</span>
                  </div>
                  <div className="font-medium text-blue-600">
                    {order.discountPercentage}%
                  </div>
                </div>
              )}
            </div>
            
            {/* Exceptions */}
            {(order.isDelayed || order.hasCancellation || order.hasDiscount) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Excepciones</h3>
                  <div className="flex flex-wrap gap-2">
                    {order.isDelayed && (
                      <Badge variant="outline" className="bg-yellow-50 border-yellow-200">
                        <Clock className="h-3 w-3 text-yellow-700 mr-1" />
                        <span className="text-xs text-yellow-700">
                          Retrasado ({order.timeElapsed}m)
                        </span>
                      </Badge>
                    )}
                    
                    {order.hasCancellation && (
                      <Badge variant="outline" className="bg-red-50 border-red-200">
                        <span className="text-xs text-red-700">
                          Cancelado
                        </span>
                      </Badge>
                    )}
                    
                    {order.hasDiscount && (
                      <Badge variant="outline" className="bg-blue-50 border-blue-200">
                        <DollarSign className="h-3 w-3 text-blue-700 mr-1" />
                        <span className="text-xs text-blue-700">
                          Descuento ({order.discountPercentage}%)
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsMessageSheetOpen(true)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Message Sheet with Recipient Selection */}
      <Sheet open={isMessageSheetOpen} onOpenChange={setIsMessageSheetOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Enviar Mensaje</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Enviar mensaje relacionado con la orden #{order.id.substring(0, 6)}
            </p>
            
            {/* Recipient Selection */}
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
            
            <Textarea
              placeholder="Escriba su mensaje aquí..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMessageSheetOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendMessage}>
                Enviar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default OrderDetailsDialog;
