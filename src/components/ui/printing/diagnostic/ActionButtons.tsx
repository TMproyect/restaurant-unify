
import { Button } from "@/components/ui/button";
import { RefreshCw, FileCode, ExternalLink } from 'lucide-react';

interface ActionButtonsProps {
  checking: boolean;
  onReload: () => void;
  onInspect: () => void;
}

export function ActionButtons({ checking, onReload, onInspect }: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onReload}
        disabled={checking}
        className="flex items-center"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Reload QZ Tray Script
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onInspect}
        disabled={checking}
        className="flex items-center"
      >
        <FileCode className="h-3 w-3 mr-1" />
        Inspect Script
      </Button>
      
      <Button
        variant="ghost" 
        size="sm"
        asChild
      >
        <a 
          href="https://qz.io/download/" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          QZ Tray Download
        </a>
      </Button>
    </div>
  );
}
