
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ApiKeySelectorProps {
  useStoredKey: boolean;
  setUseStoredKey: (value: boolean) => void;
  manualApiKey: string;
  setManualApiKey: (value: string) => void;
  fixedApiKey: string;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({
  useStoredKey,
  setUseStoredKey,
  manualApiKey,
  setManualApiKey,
  fixedApiKey
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Clave API</h3>
      <RadioGroup 
        defaultValue={useStoredKey ? "stored" : "custom"}
        onValueChange={(v) => setUseStoredKey(v === "stored")}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="stored" id="stored" checked={useStoredKey} />
          <Label 
            htmlFor="stored" 
            className="cursor-pointer"
          >
            Usar clave API del sistema <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">{fixedApiKey.substring(0, 8)}...{fixedApiKey.substring(fixedApiKey.length - 4)}</span>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" checked={!useStoredKey} />
          <Label 
            htmlFor="custom"
            className="cursor-pointer"
          >
            Usar clave personalizada
          </Label>
        </div>
      </RadioGroup>
      
      {!useStoredKey && (
        <div className="space-y-2">
          <Label htmlFor="manual-api-key">Clave API personalizada</Label>
          <Input
            id="manual-api-key"
            placeholder="Introduzca su clave API personalizada"
            value={manualApiKey}
            onChange={(e) => setManualApiKey(e.target.value)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Utilice este campo si desea probar con una clave diferente a la almacenada.
          </p>
        </div>
      )}
    </div>
  );
};
