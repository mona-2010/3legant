-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- CART TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1,
    color text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, product_id, color)
);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    order_number text UNIQUE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    street_address text NOT NULL,
    country text NOT NULL,
    town_city text NOT NULL,
    state text,
    zip_code text,
    billing_address text,
    payment_method text NOT NULL,
    shipping_method text NOT NULL,
    subtotal numeric NOT NULL,
    shipping_cost numeric DEFAULT 0,
    tax numeric(10,2) DEFAULT 0,
    discount numeric(10,2) DEFAULT 0,
    total_price numeric NOT NULL,
    status order_status DEFAULT 'pending',
    payment_intent_id text,
    tracking_number text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    delivered_at timestamp with time zone
);

-- ============================================================
-- ORDER_ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id),
    product_title text,
    product_price numeric(10,2),
    product_image text,
    product_color text,
    quantity integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- ADMIN_USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role text DEFAULT 'admin',
    permissions text[] DEFAULT ARRAY['read'],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- USER_ADDRESSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS user_addresses (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    street_address text NOT NULL,
    city text NOT NULL,
    state text,
    zip_code text NOT NULL,
    country text NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- COUPONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    description text,
    discount_type text NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    max_discount_amount numeric(10,2),
    min_purchase_amount numeric(10,2),
    max_uses integer,
    current_uses integer DEFAULT 0,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- COUPON_USAGE TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS coupon_usage (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    coupon_id uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    discount_applied numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    payment_method text NOT NULL,
    transaction_id text UNIQUE,
    stripe_payment_intent_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone
);

-- ============================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES (safe - IF NOT EXISTS)
-- ============================================================
ALTER TABLE cart ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE cart ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number text UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax numeric(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount numeric(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone;

ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_title text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_price numeric(10,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_color text;

-- ============================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================

-- ============================================================
-- ADMIN USERS RLS
-- ============================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
CREATE POLICY "Admins can manage admin users"
ON admin_users FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.user_id = auth.uid()
        AND au.is_active = true
    )
);

-- ============================================================
-- CART RLS
-- ============================================================
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their cart" ON cart;
CREATE POLICY "Users can manage their cart"
ON cart FOR ALL
USING (auth.uid() = user_id);

-- ============================================================
-- ORDERS RLS
-- ============================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their orders" ON orders;
CREATE POLICY "Users can view their orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================
-- ORDER ITEMS RLS
-- ============================================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their order items" ON order_items;
CREATE POLICY "Users can view their order items"
ON order_items FOR SELECT
USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- ============================================================
-- WISHLIST RLS
-- ============================================================
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their wishlist" ON wishlist;
CREATE POLICY "Users can manage their wishlist"
ON wishlist FOR ALL
USING (auth.uid() = user_id);

-- ============================================================
-- USER ADDRESSES RLS
-- ============================================================
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their addresses" ON user_addresses;
CREATE POLICY "Users can manage their addresses"
ON user_addresses FOR ALL
USING (auth.uid() = user_id);

-- ============================================================
-- COUPONS RLS
-- ============================================================
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can read active coupons" ON coupons;
CREATE POLICY "Everyone can read active coupons"
ON coupons FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons"
ON coupons FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.user_id = auth.uid()
        AND au.is_active = true
    )
);

-- ============================================================
-- COUPON USAGE RLS
-- ============================================================
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their coupon usage" ON coupon_usage;
CREATE POLICY "Users can view their coupon usage"
ON coupon_usage FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================
-- PAYMENTS RLS
-- ============================================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their payments" ON payments;
CREATE POLICY "Users can view their payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments"
ON payments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.user_id = auth.uid()
        AND au.is_active = true
    )
);