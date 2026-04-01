-- ============================================================
-- 1. FIX payment_status ENUM — add "succeeded" and "cancelled"
--    (DB only had: pending, completed, failed, refunded)
-- ============================================================
DO $$ BEGIN
  ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'succeeded';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'cancelled';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 2. UPDATE is_admin() to use user_roles (not admin_users)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
$$;

-- ============================================================
-- 3. ORDERS — add INSERT policy for authenticated users
--    (was missing; createOrder was silently failing)
-- ============================================================
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
CREATE POLICY "Users can insert their own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admin can manage all orders
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders"
ON orders FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 4. ORDER_ITEMS — add INSERT policy for authenticated users
-- ============================================================
DROP POLICY IF EXISTS "Users can insert their order items" ON order_items;
CREATE POLICY "Users can insert their order items"
ON order_items FOR INSERT
WITH CHECK (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);

-- Admin can manage all order items
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
CREATE POLICY "Admins can manage order items"
ON order_items FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 5. PAYMENTS — add INSERT + admin ALL policy
-- ============================================================
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;
CREATE POLICY "Users can insert their own payments"
ON payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Drop old admin policy that referenced admin_users
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can manage all payments"
ON payments FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 6. COUPON_USAGE — add INSERT policy for authenticated users
-- ============================================================
DROP POLICY IF EXISTS "Users can insert coupon usage" ON coupon_usage;
CREATE POLICY "Users can insert coupon usage"
ON coupon_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 7. COUPONS — update admin policy to use new is_admin()
-- ============================================================
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons"
ON coupons FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- 8. TRIGGER: auto-increment coupons.current_uses
--    whenever a coupon_usage row is inserted
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_coupon_uses()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.coupons
  SET current_uses = COALESCE(current_uses, 0) + 1
  WHERE id = NEW.coupon_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_coupon_usage_insert ON coupon_usage;
CREATE TRIGGER on_coupon_usage_insert
AFTER INSERT ON coupon_usage
FOR EACH ROW EXECUTE FUNCTION public.increment_coupon_uses();

-- ============================================================
-- 9. PROFILES — ensure RLS + policies use new is_admin()
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their profile" ON profiles;
CREATE POLICY "Users can manage their profile"
ON profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (public.is_admin());

-- ============================================================
-- 10. USER_ROLES — ensure RLS + policies use new is_admin()
-- ============================================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own role" ON user_roles;
CREATE POLICY "Users can read their own role"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage all roles"
ON user_roles FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
