-- ============================================================
-- PAYMENT & ORDER STATUS ENUM EXPANSION
-- ============================================================
-- Add Stripe-native statuses to payment_status enum
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'succeeded';
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Add refunded status to order_status
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'refunded';

-- ============================================================
-- PAYMENTS TABLE — FIX MISSING POLICIES
-- ============================================================
-- Allow authenticated users to insert their own payment records
DROP POLICY IF EXISTS "Users can insert their payments" ON payments;
CREATE POLICY "Users can insert their payments"
ON payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all payments (view + update status)
DROP POLICY IF EXISTS "Admins can manage payments" ON payments;
CREATE POLICY "Admins can manage payments"
ON payments FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- ORDERS TABLE — ADMIN RLS
-- ============================================================
-- Admins can update order status and manage orders
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders"
ON orders FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================================
-- ORDER ITEMS TABLE — ADMIN RLS
-- ============================================================
DROP POLICY IF EXISTS "Admins can read order items" ON order_items;
CREATE POLICY "Admins can read order items"
ON order_items FOR SELECT
USING (public.is_admin());
