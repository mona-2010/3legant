-- Consolidated Policies for E-commerce Core Tables
-- This migration ensures correct RLS and policies for storefront, admin, and user profile access.

-- ============================================================
-- 1. PRODUCTS
-- ============================================================
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."products";
CREATE POLICY "Enable read access for all users"
ON "public"."products" FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON "public"."products";
CREATE POLICY "Admins can manage products"
ON "public"."products" FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ============================================================
-- 2. COUPONS
-- ============================================================
ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read active coupons" ON "public"."coupons";
CREATE POLICY "Everyone can read active coupons"
ON "public"."coupons" FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage coupons" ON "public"."coupons";
CREATE POLICY "Admins can manage coupons"
ON "public"."coupons" FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ============================================================
-- 3. ORDERS (Update policy for address linking)
-- ============================================================
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own orders
DROP POLICY IF EXISTS "Users can view their orders" ON "public"."orders";
CREATE POLICY "Users can view their orders"
ON "public"."orders" FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to link addresses during creation/checkout
-- Note: Limited UPDATE is safer, but since this is server-side via Server Actions,
-- we allow the user's client to perform necessary updates on their own orders.
DROP POLICY IF EXISTS "Users can update their own orders" ON "public"."orders";
CREATE POLICY "Users can update their own orders"
ON "public"."orders" FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all orders
DROP POLICY IF EXISTS "Admins can manage orders" ON "public"."orders";
CREATE POLICY "Admins can manage orders"
ON "public"."orders" FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ============================================================
-- 4. USER ADDRESSES
-- ============================================================
ALTER TABLE "public"."user_addresses" ENABLE ROW LEVEL SECURITY;

-- Users can manage their own addresses (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Users can manage their addresses" ON "public"."user_addresses";
CREATE POLICY "Users can manage their addresses"
ON "public"."user_addresses" FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view addresses for order processing
DROP POLICY IF EXISTS "Admins can view all addresses" ON "public"."user_addresses";
CREATE POLICY "Admins can view all addresses"
ON "public"."user_addresses" FOR SELECT
TO authenticated
USING (public.is_admin());
