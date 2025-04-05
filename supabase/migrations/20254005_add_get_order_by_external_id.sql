
-- Función RPC para obtener pedido por ID externo
CREATE OR REPLACE FUNCTION public.get_order_by_external_id(p_external_id TEXT)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMPTZ,
  kitchen_id TEXT,
  status TEXT,
  customer_name TEXT,
  table_id UUID,
  table_number INTEGER,
  total NUMERIC,
  items_count INTEGER,
  is_delivery BOOLEAN,
  updated_at TIMESTAMPTZ,
  external_id TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT o.id, o.created_at, o.kitchen_id, o.status, o.customer_name, 
         o.table_id, o.table_number, o.total, o.items_count, o.is_delivery, 
         o.updated_at, o.external_id
  FROM public.orders o
  WHERE o.external_id = p_external_id
  LIMIT 1;
END;
$$;

-- Verificar si la columna external_id existe en la tabla orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'external_id'
  ) THEN
    -- Si no existe, agregar la columna external_id
    ALTER TABLE public.orders ADD COLUMN external_id TEXT;
  END IF;
END
$$;
