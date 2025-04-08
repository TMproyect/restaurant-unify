
-- Esta es la migración final y definitiva para el bucket menu_images
-- Reemplaza todas las migraciones anteriores con una configuración limpia y correcta

-- Primero, eliminar todas las políticas que puedan existir para evitar conflictos
DROP POLICY IF EXISTS "Public Access to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Upload Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Update Menu Images" ON storage.objects; 
DROP POLICY IF EXISTS "Delete Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow FULL Public Access to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Public SELECT to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Full Public Access to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Menu Images Complete Access" ON storage.objects;

-- Asegurar que el bucket existe y es 100% público
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu_images', 'menu_images', true)
ON CONFLICT (id) DO UPDATE 
SET public = true;

-- Crear políticas totalmente permisivas (sin restricciones de usuario)
-- Esta es la política más simple y permisiva posible para evitar problemas de RLS
CREATE POLICY "Menu Images Complete Access" 
ON storage.objects FOR ALL 
USING (bucket_id = 'menu_images');

-- Actualizar objetos existentes para asegurar que sean públicos
UPDATE storage.objects 
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{isPublic}', 'true')
WHERE bucket_id = 'menu_images';

-- Función de utilidad para verificar y reinicializar el bucket desde RPC si es necesario
CREATE OR REPLACE FUNCTION public.verify_menu_images_bucket()
RETURNS boolean AS $$
DECLARE
  bucket_exists boolean;
BEGIN
  -- Verificar si el bucket existe
  SELECT EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'menu_images') INTO bucket_exists;
  
  -- Si no existe, crearlo
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('menu_images', 'menu_images', true);
  END IF;
  
  -- Asegurar que sea público
  UPDATE storage.buckets SET public = true WHERE id = 'menu_images';
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
