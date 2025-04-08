
import React from 'react';
import LowStockAlert from '../inventory/LowStockAlert';
import { useNavigate } from 'react-router-dom';

const InventoryAlert: React.FC = () => {
  const navigate = useNavigate();
  console.log('🔄 [InventoryAlert] Rendering inventory alert component');
  
  const handleViewInventory = () => {
    console.log('🔄 [InventoryAlert] Navigating to inventory page');
    navigate('/inventory');
  };

  return <LowStockAlert onViewInventory={handleViewInventory} />;
};

export default InventoryAlert;
