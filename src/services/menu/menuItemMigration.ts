
import { supabase } from '@/integrations/supabase/client';
import { migrateBase64ToStorage, migrateAllBase64Images } from '../storage';

// Re-export the functions from the storage module
export { migrateBase64ToStorage, migrateAllBase64Images };
