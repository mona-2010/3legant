-- Align schema to updated ERD workflow

-- 1) Roles now live in profiles.role
DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'user';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'user_roles'
  ) THEN
    UPDATE public.profiles p
    SET role = CASE WHEN ur.role = 'admin' THEN 'admin'::user_role ELSE 'user'::user_role END
    FROM public.user_roles ur
    WHERE ur.user_id = p.id;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  );
$$;

-- 2) Split cart into cart + cart_items
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'cart'
      AND column_name = 'product_id'
  ) THEN
    ALTER TABLE public.cart RENAME TO cart_items_legacy;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.cart(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (cart_id, product_id, color)
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'cart_items_legacy'
  ) THEN
    INSERT INTO public.cart (user_id)
    SELECT DISTINCT user_id
    FROM public.cart_items_legacy
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.cart_items (cart_id, product_id, quantity, color, created_at, updated_at)
    SELECT
      c.id,
      l.product_id,
      GREATEST(COALESCE(l.quantity, 1), 1),
      l.color,
      COALESCE(l.created_at, now()),
      COALESCE(l.updated_at, now())
    FROM public.cart_items_legacy l
    INNER JOIN public.cart c ON c.user_id = l.user_id
    ON CONFLICT (cart_id, product_id, color)
    DO UPDATE SET
      quantity = EXCLUDED.quantity,
      updated_at = now();

    DROP TABLE public.cart_items_legacy;
  END IF;
END $$;

ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their cart" ON public.cart;
CREATE POLICY "Users can manage their cart"
ON public.cart FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their cart items" ON public.cart_items;
CREATE POLICY "Users can manage their cart items"
ON public.cart_items FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.cart c
    WHERE c.id = cart_id
      AND c.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.cart c
    WHERE c.id = cart_id
      AND c.user_id = auth.uid()
  )
);

-- 3) Orders now also keep user payload as jsonb and address refs
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS user_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS shipping_address_id uuid REFERENCES public.user_addresses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS billing_address_id uuid REFERENCES public.user_addresses(id) ON DELETE SET NULL;

-- 3.1) Product offer window (optional)
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS valid_until timestamp with time zone;

-- 4) Coupon usage merged into orders + coupons
DROP TABLE IF EXISTS public.coupon_usage CASCADE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'coupons'
  ) THEN
    ALTER TABLE public.orders
      ADD COLUMN IF NOT EXISTS coupon_id uuid REFERENCES public.coupons(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.refresh_coupon_usage_count(target_coupon_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.coupons c
  SET current_uses = (
    SELECT COUNT(*)::integer
    FROM public.orders o
    WHERE o.coupon_id = c.id
  )
  WHERE c.id = target_coupon_id;
$$;

CREATE OR REPLACE FUNCTION public.sync_coupon_usage_from_orders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.coupon_id IS NOT NULL THEN
      PERFORM public.refresh_coupon_usage_count(NEW.coupon_id);
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF OLD.coupon_id IS DISTINCT FROM NEW.coupon_id THEN
      IF OLD.coupon_id IS NOT NULL THEN
        PERFORM public.refresh_coupon_usage_count(OLD.coupon_id);
      END IF;
      IF NEW.coupon_id IS NOT NULL THEN
        PERFORM public.refresh_coupon_usage_count(NEW.coupon_id);
      END IF;
    END IF;
    RETURN NEW;
  ELSE
    IF OLD.coupon_id IS NOT NULL THEN
      PERFORM public.refresh_coupon_usage_count(OLD.coupon_id);
    END IF;
    RETURN OLD;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS on_orders_coupon_sync ON public.orders;
CREATE TRIGGER on_orders_coupon_sync
AFTER INSERT OR UPDATE OR DELETE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_coupon_usage_from_orders();

-- 5) remove old role table once role migration is complete
DROP TABLE IF EXISTS public.user_roles CASCADE;
