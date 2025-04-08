
-- Crear una tabla de ayuda para manejar la reinicialización del bucket
CREATE TABLE IF NOT EXISTS public.storage_policies_fix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_manual_fix BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed BOOLEAN DEFAULT false
);

-- Crear una función que se ejecuta en respuesta a las inserciones
CREATE OR REPLACE FUNCTION public.handle_storage_policy_fix()
RETURNS TRIGGER AS $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Verificar si el bucket existe
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'menu_images'
  ) INTO bucket_exists;
  
  -- Si el bucket no existe, crearlo
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('menu_images', 'menu_images', true);
  ELSE
    -- Actualizar el bucket para asegurarse que sea público
    UPDATE storage.buckets 
    SET public = true
    WHERE id = 'menu_images';
  END IF;
  
  -- Eliminar políticas existentes para evitar duplicados
  DELETE FROM storage.policies 
  WHERE bucket_id = 'menu_images';
  
  -- Crear políticas permisivas
  INSERT INTO storage.policies (name, bucket_id, operation, permission, definition)
  VALUES 
    ('Public Access to Menu Images', 'menu_images', 'SELECT', 'PERMISSIVE', 'bucket_id = ''menu_images'''),
    ('Upload Menu Images', 'menu_images', 'INSERT', 'PERMISSIVE', 'bucket_id = ''menu_images'''),
    ('Update Menu Images', 'menu_images', 'UPDATE', 'PERMISSIVE', 'bucket_id = ''menu_images'''),
    ('Delete Menu Images', 'menu_images', 'DELETE', 'PERMISSIVE', 'bucket_id = ''menu_images''');
  
  -- Marcar como procesado
  UPDATE public.storage_policies_fix
  SET processed = true
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger que ejecuta la función
DROP TRIGGER IF EXISTS trigger_storage_policy_fix ON public.storage_policies_fix;
CREATE TRIGGER trigger_storage_policy_fix
AFTER INSERT ON public.storage_policies_fix
FOR EACH ROW
EXECUTE FUNCTION public.handle_storage_policy_fix();

-- Crear un índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_storage_policies_fix_trigger
ON public.storage_policies_fix(trigger_manual_fix, processed);
