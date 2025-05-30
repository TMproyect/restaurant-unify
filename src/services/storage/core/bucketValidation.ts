
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Service for validating and ensuring the menu_images bucket is correctly configured
 */
export class BucketValidationService {
  private static readonly BUCKET_ID = 'menu_images';
  
  /**
   * Validates that the bucket exists and is properly configured
   */
  static async validateBucket(): Promise<boolean> {
    try {
      console.log('📦 BucketValidation - Validating menu_images bucket...');
      
      // First, try to list buckets to check if menu_images exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('📦 BucketValidation - Error listing buckets:', bucketsError);
        return false;
      }
      
      const menuImagesBucket = buckets?.find(bucket => bucket.id === this.BUCKET_ID);
      
      if (!menuImagesBucket) {
        console.error('📦 BucketValidation - menu_images bucket not found');
        await this.attemptBucketRepair();
        return false;
      }
      
      console.log('📦 BucketValidation - Bucket found:', {
        id: menuImagesBucket.id,
        name: menuImagesBucket.name,
        public: menuImagesBucket.public
      });
      
      // Try a simple test operation to verify permissions
      return await this.testBucketPermissions();
      
    } catch (error) {
      console.error('📦 BucketValidation - Exception during validation:', error);
      return false;
    }
  }
  
  /**
   * Tests if we can perform basic operations on the bucket
   */
  private static async testBucketPermissions(): Promise<boolean> {
    try {
      console.log('📦 BucketValidation - Testing bucket permissions...');
      
      // Try to list files in the bucket (this should work even if empty)
      const { data, error } = await supabase.storage
        .from(this.BUCKET_ID)
        .list('', { limit: 1 });
      
      if (error) {
        console.error('📦 BucketValidation - Permission test failed:', error);
        return false;
      }
      
      console.log('📦 BucketValidation - ✅ Bucket permissions test passed');
      return true;
      
    } catch (error) {
      console.error('📦 BucketValidation - Exception during permission test:', error);
      return false;
    }
  }
  
  /**
   * Attempts to repair the bucket using the database function
   */
  private static async attemptBucketRepair(): Promise<boolean> {
    try {
      console.log('📦 BucketValidation - Attempting bucket repair...');
      
      const { data, error } = await supabase
        .rpc('verify_and_repair_menu_images_bucket');
      
      if (error) {
        console.error('📦 BucketValidation - Repair function failed:', error);
        return false;
      }
      
      console.log('📦 BucketValidation - Repair result:', data);
      return data?.status === 'repaired';
      
    } catch (error) {
      console.error('📦 BucketValidation - Exception during repair:', error);
      return false;
    }
  }
  
  /**
   * Shows user-friendly error message for bucket issues
   */
  static showBucketError(): void {
    toast.error('Error de configuración de almacenamiento. Contacte al administrador.', {
      duration: 5000
    });
  }
}
