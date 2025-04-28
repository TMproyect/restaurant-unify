
-- Create historical_orders table to store archived orders
CREATE TABLE IF NOT EXISTS public.historical_orders (
  id UUID NOT NULL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  table_number INTEGER,
  table_id UUID,
  status TEXT NOT NULL,
  total NUMERIC NOT NULL DEFAULT 0,
  items_count INTEGER NOT NULL DEFAULT 0,
  is_delivery BOOLEAN NOT NULL DEFAULT false,
  kitchen_id TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  external_id TEXT,
  discount NUMERIC,
  order_source TEXT
);

-- Create historical_order_items table
CREATE TABLE IF NOT EXISTS public.historical_order_items (
  id UUID NOT NULL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.historical_orders(id),
  menu_item_id UUID,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create function to archive orders
CREATE OR REPLACE FUNCTION public.archive_orders(order_ids UUID[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert orders into historical_orders
  INSERT INTO public.historical_orders (
    id, customer_name, table_number, table_id, status, total, 
    items_count, is_delivery, kitchen_id, created_at, updated_at, 
    external_id, discount, order_source
  )
  SELECT
    id, customer_name, table_number, table_id, status, total, 
    items_count, is_delivery, kitchen_id, created_at, updated_at, 
    external_id, discount, order_source
  FROM public.orders
  WHERE id = ANY(order_ids);
  
  -- Insert order_items into historical_order_items
  INSERT INTO public.historical_order_items (
    id, order_id, menu_item_id, name, price, quantity, notes, created_at
  )
  SELECT
    oi.id, oi.order_id, oi.menu_item_id, oi.name, oi.price, oi.quantity, oi.notes, oi.created_at
  FROM public.order_items oi
  WHERE oi.order_id = ANY(order_ids);
  
  -- Delete the original order_items
  DELETE FROM public.order_items
  WHERE order_id = ANY(order_ids);
  
  -- Delete the original orders
  DELETE FROM public.orders
  WHERE id = ANY(order_ids);
  
END;
$$;
