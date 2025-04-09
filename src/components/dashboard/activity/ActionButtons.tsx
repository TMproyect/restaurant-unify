
import React from 'react';
import { Button } from '@/components/ui/button';
import { ActionButtonsProps } from './types';

const ActionButtons: React.FC<ActionButtonsProps> = ({ actions, onActionClick }) => {
  return (
    <div className="flex gap-1">
      {actions.map((action, idx) => (
        <Button
          key={idx}
          size="sm"
          variant={
            action.type === 'danger' ? 'destructive' :
            action.type === 'warning' ? 'secondary' : 'outline'
          }
          className="h-7 text-xs"
          onClick={() => onActionClick(action.action)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default ActionButtons;
