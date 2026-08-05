ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;
GRANT INSERT ON public.orders TO anon;
CREATE POLICY "guest orders insert" ON public.orders FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "receipts guest insert" ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'receipts' AND (storage.foldername(name))[1] = 'guest');