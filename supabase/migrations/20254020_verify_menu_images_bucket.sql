
-- Crear una función RPC para verificar y corregir el bucket de imágenes
CREATE OR REPLACE FUNCTION public.verify_menu_images_bucket()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar si el bucket existe
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'menu_images') THEN
    -- Crear el bucket si no existe
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('menu_images', 'menu_images', true);
  ELSE
    -- Actualizar el bucket para asegurar que sea público
    UPDATE storage.buckets 
    SET public = true
    WHERE id = 'menu_images';
  END IF;
  
  -- Eliminar políticas antiguas para evitar conflictos
  DROP POLICY IF EXISTS "Allow FULL Public Access to Menu Images" ON storage.objects;
  DROP POLICY IF EXISTS "Public SELECT to Menu Images" ON storage.objects;
  DROP POLICY IF EXISTS "Menu Images Complete Access" ON storage.objects;
  
  -- Crear una única política permisiva
  CREATE POLICY "Menu Images Complete Access" 
  ON storage.objects FOR ALL 
  USING (bucket_id = 'menu_images');
  
  -- Actualizar todos los objetos existentes para asegurar que sean públicos
  UPDATE storage.objects 
  SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{isPublic}', 'true')
  WHERE bucket_id = 'menu_images';
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error verificando bucket menu_images: %', SQLERRM;
    RETURN false;
END;
$$;
