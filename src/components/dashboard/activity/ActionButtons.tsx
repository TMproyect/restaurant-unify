
import React from 'react';
import { Button } from '@/components/ui/button';
import { ActionButtonsProps } from './types';

const ActionButtons: React.FC<ActionButtonsProps> = ({ actions, onActionClick }) => {
  const handleActionClick = (e: React.MouseEvent, actionId: string) => {
    e.stopPropagation(); // Prevent event bubbling if this is inside a clickable container
    e.preventDefault(); // Prevent any default behavior
    if (onActionClick) {
      onActionClick(actionId);
    }
  };

  // Parse action strings to get action type and label
  const getActionDetails = (actionString: string) => {
    const [actionType, actionId] = actionString.split(':');
    
    let label = 'Ver';
    let type: 'default' | 'warning' | 'danger' | 'success' = 'default';
    
    // Determine button label and type based on action
    switch (actionType) {
      case 'view':
        label = 'Ver';
        type = 'default';
        break;
      case 'prioritize':
        label = 'Priorizar';
        type = 'warning';
        break;
      case 'review-cancel':
        label = 'Cancelar';
        type = 'danger';
        break;
      case 'review-discount':
        label = 'Descuento';
        type = 'success';
        break;
      case 'cancel':
        label = 'Cancelar';
        type = 'danger';
        break;
      default:
        label = actionType;
    }
    
    return { label, type, action: actionString };
  };

  return (
    <div className="flex gap-1">
      {actions.map((actionString, idx) => {
        const { label, type, action } = getActionDetails(actionString);
        return (
          <Button
            key={idx}
            size="sm"
            variant={
              type === 'danger' ? 'destructive' :
              type === 'warning' ? 'warning' : 'outline'
            }
            className="h-7 text-xs"
            onClick={(e) => handleActionClick(e, action)}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
};

export default ActionButtons;
