
-- Eliminamos políticas existentes que podrían estar mal configuradas
DROP POLICY IF EXISTS "Public Access to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Upload Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Update Menu Images" ON storage.objects; 
DROP POLICY IF EXISTS "Delete Menu Images" ON storage.objects;

-- Creamos el bucket si no existe
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu_images', 'menu_images', true)
ON CONFLICT (id) DO UPDATE 
SET public = true;

-- Creamos las políticas necesarias
CREATE POLICY "Public Access to Menu Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'menu_images');

CREATE POLICY "Upload Menu Images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'menu_images');

CREATE POLICY "Update Menu Images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'menu_images');

CREATE POLICY "Delete Menu Images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'menu_images');
