-- Enable RLS on products table
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

-- Ensure the products table is added to the realtime publication
-- This check prevents "already a member of publication" errors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'products'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
END $$;

-- Create an explicit SELECT policy to allow all users to read the products table via Realtime.
-- Realtime requires users to have SELECT permissions to receive update streams.
-- Using DROP/CREATE for idempotency
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."products";
CREATE POLICY "Enable read access for all users" 
ON "public"."products"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
