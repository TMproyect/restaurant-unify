
import React from 'react';
import { Button } from '@/components/ui/button';
import { ActionButtonsProps } from './types';

const ActionButtons: React.FC<ActionButtonsProps> = ({ actions, onActionClick }) => {
  const handleActionClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation(); // Prevent event bubbling if this is inside a clickable container
    e.preventDefault(); // Prevent any default behavior
    if (onActionClick) {
      onActionClick(action);
    }
  };

  return (
    <div className="flex gap-1">
      {actions.map((action, idx) => (
        <Button
          key={idx}
          size="sm"
          variant={
            action.type === 'danger' ? 'destructive' :
            action.type === 'warning' ? 'warning' : 'outline'
          }
          className="h-7 text-xs"
          onClick={(e) => handleActionClick(e, action.action)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default ActionButtons;
