
-- Primero eliminamos políticas existentes que podrían estar mal configuradas
DROP POLICY IF EXISTS "Public Access to Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Upload Menu Images" ON storage.objects;
DROP POLICY IF EXISTS "Update Menu Images" ON storage.objects; 
DROP POLICY IF EXISTS "Delete Menu Images" ON storage.objects;

-- Aseguramos que el bucket exista y sea público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu_images', 'menu_images', true)
ON CONFLICT (id) DO UPDATE 
SET public = true;

-- Creamos políticas totalmente permisivas
CREATE POLICY "Allow FULL Public Access to Menu Images" 
ON storage.objects FOR ALL 
USING (bucket_id = 'menu_images');

-- Creamos una política específica para SELECT para asegurar acceso público
CREATE POLICY "Public SELECT to Menu Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'menu_images');

-- Esta función permitirá que el SQL Editor pueda ejecutar acciones para reinicializar el bucket
CREATE OR REPLACE FUNCTION public.initialize_menu_images_bucket()
RETURNS VOID AS $$
BEGIN
  -- Asegurar que el bucket exista
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('menu_images', 'menu_images', true)
  ON CONFLICT (id) DO UPDATE 
  SET public = true;
  
  -- Eliminar y recrear políticas
  BEGIN
    DROP POLICY IF EXISTS "Allow FULL Public Access to Menu Images" ON storage.objects;
    DROP POLICY IF EXISTS "Public SELECT to Menu Images" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
      -- Ignorar errores
  END;
  
  -- Crear nuevas políticas
  CREATE POLICY "Allow FULL Public Access to Menu Images" 
  ON storage.objects FOR ALL 
  USING (bucket_id = 'menu_images');
  
  CREATE POLICY "Public SELECT to Menu Images" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'menu_images');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
