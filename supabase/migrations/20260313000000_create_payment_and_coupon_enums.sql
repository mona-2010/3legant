-- Create payment_type enum
CREATE TYPE payment_type AS ENUM ('credit_card', 'paypal');

-- Create coupon_discount_type enum
CREATE TYPE coupon_discount_type AS ENUM ('fixed', 'percentage');
