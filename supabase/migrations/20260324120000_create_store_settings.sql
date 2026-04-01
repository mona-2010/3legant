-- Create store_settings table
CREATE TABLE IF NOT EXISTS store_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage settings
CREATE POLICY "Admins can manage settings"
ON store_settings FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Everyone (including users) can read settings (needed for cancellation/refund logic checks)
CREATE POLICY "Everyone can read settings"
ON store_settings FOR SELECT
USING (true);

-- Seed initial settings
INSERT INTO store_settings (key, value)
VALUES 
    ('cancellation_refund_days', '3'::jsonb),
    ('refund_request_days', '30'::jsonb)
ON CONFLICT (key) DO NOTHING;
