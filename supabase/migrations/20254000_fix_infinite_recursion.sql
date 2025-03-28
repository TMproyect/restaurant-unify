
-- Agregar una función rpc para obtener perfiles sin causar recursión
CREATE OR REPLACE FUNCTION public.get_all_profiles()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.profiles ORDER BY created_at DESC;
$$;
