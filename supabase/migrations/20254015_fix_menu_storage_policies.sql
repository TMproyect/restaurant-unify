
-- Drop all potentially conflicting policies
DROP POLICY IF EXISTS "Public Access to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Upload Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Update Menu Images" ON storage.objects; 
DROP POLICY IF EXISTS "Delete Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow FULL Public Access to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Public SELECT to Menu Images" ON storage.objects;

-- Create or recreate the bucket with public access
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu_images', 'menu_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create a single policy that allows ALL actions for ANY user (authenticated or not)
CREATE POLICY "Full Public Access to Menu Images" 
ON storage.objects FOR ALL 
USING (bucket_id = 'menu_images');

-- Update any existing objects to ensure they have correct bucket settings
UPDATE storage.objects 
SET metadata = jsonb_set(metadata, '{isPublic}', 'true')
WHERE bucket_id = 'menu_images';
