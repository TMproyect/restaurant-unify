
import { useEffect } from 'react';
import { initializeStorage } from '@/services/storage';

const SilentStorageInitializer: React.FC = () => {
  useEffect(() => {
    const initStorage = async () => {
      try {
        await initializeStorage();
        console.log('Storage initialized successfully');
      } catch (err) {
        console.warn('Storage initialization failed silently:', err);
      }
    };
    
    initStorage();
  }, []);

  // This component renders nothing - it just initializes storage silently
  return null;
};

export default SilentStorageInitializer;
