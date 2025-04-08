
-- Esta migración garantiza que el bucket menu_images exista y tenga políticas correctas

-- Asegurar que el bucket existe y es público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu_images', 'menu_images', true)
ON CONFLICT (id) DO UPDATE 
SET public = true;

-- Eliminar políticas existentes que podrían estar mal configuradas
DROP POLICY IF EXISTS "Public Access to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Upload Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Update Menu Images" ON storage.objects; 
DROP POLICY IF EXISTS "Delete Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow FULL Public Access to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Public SELECT to Menu Images" ON storage.objects;

-- Crear nuevas políticas permisivas
CREATE POLICY "Public Access to Menu Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'menu_images');

CREATE POLICY "Upload Menu Images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'menu_images');

CREATE POLICY "Update Menu Images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'menu_images');

CREATE POLICY "Delete Menu Images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'menu_images');
