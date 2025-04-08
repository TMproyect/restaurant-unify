
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ApiKeySelectorProps {
  useStoredKey: boolean;
  setUseStoredKey: (value: boolean) => void;
  manualApiKey: string;
  setManualApiKey: (value: string) => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({
  useStoredKey,
  setUseStoredKey,
  manualApiKey,
  setManualApiKey
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="useStoredKey" 
          checked={useStoredKey} 
          onChange={() => setUseStoredKey(!useStoredKey)} 
          className="h-4 w-4"
        />
        <Label htmlFor="useStoredKey">Usar API key almacenada en la base de datos</Label>
      </div>
      
      {!useStoredKey && (
        <div className="space-y-2">
          <Label htmlFor="manualApiKey">API Key Manual:</Label>
          <Input
            id="manualApiKey"
            value={manualApiKey}
            onChange={(e) => setManualApiKey(e.target.value)}
            placeholder="Ingrese la API key manualmente"
            className="font-mono"
          />
        </div>
      )}
    </div>
  );
};
