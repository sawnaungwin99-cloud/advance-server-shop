UPDATE public.orders SET status = 'processing' WHERE status = 'confirmed';
UPDATE public.orders SET status = 'completed' WHERE status = 'delivered';
UPDATE public.orders SET status = 'completed' WHERE delivered_username IS NOT NULL AND delivered_password IS NOT NULL;