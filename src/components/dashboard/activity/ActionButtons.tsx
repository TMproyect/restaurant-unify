
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, AlertTriangle, Zap, Receipt } from 'lucide-react';
import { ActionButtonsProps } from './types';

const ActionButtons: React.FC<ActionButtonsProps> = ({ actions, onActionClick }) => {
  const handleActionClick = (e: React.MouseEvent, actionId: string) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault(); // Prevent any default behavior
    if (onActionClick) {
      onActionClick(actionId);
    }
  };

  // Parse action strings to get action type and display appropriate buttons
  const getActionDetails = (actionString: string) => {
    const [actionType, actionId] = actionString.split(':');
    
    let label = 'Ver';
    let icon = <Eye className="h-3.5 w-3.5 mr-1" />;
    let type: 'default' | 'warning' | 'danger' | 'success' = 'default';
    
    // Determine button label, icon and type based on action
    switch (actionType) {
      case 'view':
        label = 'Ver Detalles';
        icon = <Eye className="h-3.5 w-3.5 mr-1" />;
        type = 'default';
        break;
      case 'prioritize':
        label = 'Priorizar';
        icon = <Zap className="h-3.5 w-3.5 mr-1" />;
        type = 'warning';
        break;
      case 'review-cancel':
        label = 'Revisar Cancelación';
        icon = <AlertTriangle className="h-3.5 w-3.5 mr-1" />;
        type = 'danger';
        break;
      case 'view-receipt':
        label = 'Ver Recibo';
        icon = <Receipt className="h-3.5 w-3.5 mr-1" />;
        type = 'success';
        break;
      default:
        label = actionType;
    }
    
    return { label, icon, type, action: actionString };
  };

  return (
    <div className="flex gap-1 flex-wrap justify-center">
      {actions.map((actionString, idx) => {
        const { label, icon, type, action } = getActionDetails(actionString);
        return (
          <Button
            key={idx}
            size="sm"
            variant={
              type === 'danger' ? 'destructive' :
              type === 'warning' ? 'warning' : 
              type === 'success' ? 'outline' : 'outline'
            }
            className="h-7 text-xs flex items-center whitespace-nowrap"
            onClick={(e) => handleActionClick(e, action)}
          >
            {icon}
            {label}
          </Button>
        );
      })}
    </div>
  );
};

export default ActionButtons;
