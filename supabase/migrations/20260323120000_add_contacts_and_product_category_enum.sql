DO $$
BEGIN
  CREATE TYPE public.product_category AS ENUM (
    'living_room',
    'bedroom',
    'kitchen',
    'bathroom',
    'dining',
    'outdoor'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND column_name = 'category'
      AND udt_name = '_text'
  ) THEN
    ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS category_v2 public.product_category[];

    UPDATE public.products
    SET category_v2 = (
      SELECT array_agg(mapped)
      FROM (
        SELECT CASE lower(replace(trim(raw_value), ' ', '_'))
          WHEN 'living_room' THEN 'living_room'::public.product_category
          WHEN 'bedroom' THEN 'bedroom'::public.product_category
          WHEN 'kitchen' THEN 'kitchen'::public.product_category
          WHEN 'bathroom' THEN 'bathroom'::public.product_category
          WHEN 'dining' THEN 'dining'::public.product_category
          WHEN 'outdoor' THEN 'outdoor'::public.product_category
          ELSE NULL
        END AS mapped
        FROM unnest(category) AS raw_value
      ) normalized
      WHERE mapped IS NOT NULL
    )
    WHERE category IS NOT NULL;

    ALTER TABLE public.products
    DROP COLUMN category;

    ALTER TABLE public.products
    RENAME COLUMN category_v2 TO category;
  END IF;
END $$;

ALTER TABLE IF EXISTS public.products
ADD COLUMN IF NOT EXISTS measurements text,
ADD COLUMN IF NOT EXISTS weight text;

CREATE TABLE IF NOT EXISTS public.contact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_created_at ON public.contact(created_at DESC);

ALTER TABLE public.contact ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact;
CREATE POLICY "Anyone can submit contact form"
ON public.contact
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact;
CREATE POLICY "Admins can read contact messages"
ON public.contact
FOR SELECT
TO authenticated
USING (public.is_admin());

GRANT INSERT ON TABLE public.contact TO anon;
GRANT INSERT ON TABLE public.contact TO authenticated;
GRANT SELECT ON TABLE public.contact TO authenticated;
GRANT ALL ON TABLE public.contact TO service_role;
