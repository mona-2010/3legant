-- Allow authenticated users to INSERT their own orders
DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to INSERT order items for their own orders
DROP POLICY IF EXISTS "Users can create order items" ON order_items;
CREATE POLICY "Users can create order items"
ON order_items FOR INSERT
WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- Allow authenticated users to INSERT payment records for their own orders
DROP POLICY IF EXISTS "Users can create payments" ON payments;
CREATE POLICY "Users can create payments"
ON payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to INSERT coupon usage for themselves
DROP POLICY IF EXISTS "Users can create coupon usage" ON coupon_usage;
CREATE POLICY "Users can create coupon usage"
ON coupon_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);
