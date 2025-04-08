
-- Create an RPC function to reinitialize the menu_images bucket with policies
CREATE OR REPLACE FUNCTION public.reinitialize_menu_images_bucket()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  -- Ensure the bucket exists and is public
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('menu_images', 'menu_images', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
  
  -- Remove existing policies for this bucket
  DELETE FROM storage.policies 
  WHERE bucket_id = 'menu_images';
  
  -- Create new permissive policies
  EXECUTE 'CREATE POLICY "Public Access to Menu Images" ON storage.objects FOR SELECT USING (bucket_id = ''menu_images'')';
  EXECUTE 'CREATE POLICY "Upload Menu Images" ON storage.objects FOR INSERT USING (bucket_id = ''menu_images'')';
  EXECUTE 'CREATE POLICY "Update Menu Images" ON storage.objects FOR UPDATE USING (bucket_id = ''menu_images'')';
  EXECUTE 'CREATE POLICY "Delete Menu Images" ON storage.objects FOR DELETE USING (bucket_id = ''menu_images'')';
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error reinicializando bucket: %', SQLERRM;
    RETURN false;
END;
$$;
