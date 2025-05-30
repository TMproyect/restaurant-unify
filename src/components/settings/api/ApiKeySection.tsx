
import React from 'react';
import { Label } from '@/components/ui/label';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ApiKeyDisplay } from './ApiKeyDisplay';

// Updated with a more complex API key
export const ApiKeySection = () => {
  const fixedApiKey = "pos_api_XJ7p2Q8rK#5LmVz9F3eTy1A@Bc6D";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor="api-key">Clave API Secreta:</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="inline-flex items-center justify-center h-5 w-5 rounded-full p-0">
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="sr-only">Ayuda</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Esta clave secreta permite a sistemas externos enviar pedidos a tu POS. Cópiala en tu sistema externo (ej: n8n).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <ApiKeyDisplay apiKey={fixedApiKey} />
    </div>
  );
};
