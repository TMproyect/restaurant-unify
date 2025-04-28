
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText, Printer } from 'lucide-react';

interface ActionButtonsProps {
  checking: boolean;
  onReload: () => void;
  onInspect: () => void;
  onTestPrint?: () => void;
  showTestPrint?: boolean;
}

export function ActionButtons({ 
  checking, 
  onReload, 
  onInspect, 
  onTestPrint,
  showTestPrint = false
}: ActionButtonsProps) {
  return (
    <div className="flex justify-end space-x-2">
      {showTestPrint && onTestPrint && (
        <Button
          variant="outline"
          size="sm"
          onClick={onTestPrint}
          disabled={checking}
        >
          <Printer className="h-3.5 w-3.5 mr-1" />
          Test Print
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onInspect}
        disabled={checking}
      >
        <FileText className="h-3.5 w-3.5 mr-1" />
        Inspect Script
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onReload}
        disabled={checking}
      >
        <RefreshCw className={`h-3.5 w-3.5 mr-1 ${checking ? 'animate-spin' : ''}`} />
        {checking ? 'Reloading...' : 'Reload Script'}
      </Button>
    </div>
  );
}
