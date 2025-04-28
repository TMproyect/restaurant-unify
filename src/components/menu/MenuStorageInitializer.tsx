
import { useEffect } from 'react';
import { initializeStorage } from '@/services/storage';

const MenuStorageInitializer: React.FC = () => {
  useEffect(() => {
    // Iniciar almacenamiento en paralelo sin bloquear
    initializeStorage().catch(() => {
      // Ignorar errores de inicialización - no afectan la UI
    });
  }, []);

  return null; // Este componente no renderiza nada
};

export default MenuStorageInitializer;
