
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, AlertTriangle } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PermissionItemProps {
  id: string;
  name: string;
  description?: string;
  isChecked: boolean;
  isCriticalPermission: boolean;
  onChange: () => void;
}

const PermissionItem: React.FC<PermissionItemProps> = ({
  id,
  name,
  description,
  isChecked,
  isCriticalPermission,
  onChange
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Switch
          id={`perm-${id}`}
          checked={isChecked}
          onCheckedChange={onChange}
          disabled={isCriticalPermission && isChecked}
        />
        <div className="space-y-0.5">
          <Label 
            htmlFor={`perm-${id}`}
            className="text-sm font-medium cursor-pointer flex items-center"
          >
            {name}
            {isCriticalPermission && isChecked && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle size={14} className="ml-1 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Este es un permiso crítico que no puede ser desactivado para evitar pérdida de acceso al sistema.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Label>
          {description && (
            <div className="flex items-center">
              <p className="text-xs text-muted-foreground">{description}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1">
                      <HelpCircle size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionItem;
