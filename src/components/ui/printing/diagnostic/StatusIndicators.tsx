
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusIndicatorProps {
  isChecking: boolean;
  exists: boolean | null;
  label: string;
}

export function StatusIndicator({ isChecking, exists, label }: StatusIndicatorProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-medium text-sm">{label}</span>
      {isChecking ? (
        <Badge variant="outline" className="bg-slate-100">
          Checking...
        </Badge>
      ) : (
        <Badge 
          variant="outline" 
          className={exists ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
        >
          {exists ? (
            <Check className="h-3 w-3 mr-1" />
          ) : (
            <X className="h-3 w-3 mr-1" />
          )}
          {exists ? "Found" : "Not Found"}
        </Badge>
      )}
    </div>
  );
}
