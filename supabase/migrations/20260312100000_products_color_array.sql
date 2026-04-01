-- Change products.color from text to text[] to support multiple colors per product
-- Use DO block to make idempotent (skip if already text[])
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'color' AND udt_name = 'text'
  ) THEN
    ALTER TABLE products ALTER COLUMN color TYPE text[] USING CASE WHEN color IS NOT NULL THEN ARRAY[color] ELSE NULL END;
  END IF;
END $$;

-- Add short_description column if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description text;

-- Drop conflicting unique constraint on cart (keep only user_id, product_id)
ALTER TABLE cart DROP CONSTRAINT IF EXISTS cart_unique_product;
