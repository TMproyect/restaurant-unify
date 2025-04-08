
-- Create menu_images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu_images', 'menu_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the menu_images bucket
CREATE POLICY "Public Access to Menu Images" ON storage.objects FOR SELECT USING (bucket_id = 'menu_images');

-- Allow authenticated users to upload to menu_images
CREATE POLICY "Upload Menu Images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'menu_images');

-- Allow authenticated users to update menu images
CREATE POLICY "Update Menu Images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'menu_images');

-- Allow authenticated users to delete menu images
CREATE POLICY "Delete Menu Images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'menu_images');

-- Add CORS configuration to allow access from any origin (this helps with image loading)
UPDATE storage.buckets 
SET cors_origins = '{*}'
WHERE id = 'menu_images';

-- Increase file size limit in config.toml (already set to 10MB, which should be sufficient)
