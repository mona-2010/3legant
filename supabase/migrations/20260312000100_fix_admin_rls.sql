-- Fix self-referencing RLS policy on admin_users
-- The old policy checked "EXISTS (SELECT 1 FROM admin_users ...)" which creates
-- a circular dependency that always blocks reads.

-- Drop the broken policy
DROP POLICY IF EXISTS "Admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can check own admin status" ON admin_users;

-- Allow authenticated users to read their own admin row (needed for verifyAdmin)
CREATE POLICY "Users can check own admin status"
ON admin_users FOR SELECT
USING (auth.uid() = user_id);

-- Allow active admins to manage (insert/update/delete) all admin_users rows
-- This uses a security definer function to avoid the circular RLS issue
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND is_active = true
  );
$$;

CREATE POLICY "Admins can manage admin users"
ON admin_users FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
