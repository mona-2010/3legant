-- Auto-deactivate coupons when they reach max_uses.
-- Keeps existing behavior of usage counting from orders-based sync.
CREATE OR REPLACE FUNCTION public.refresh_coupon_usage_count(target_coupon_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.coupons c
  SET
    current_uses = usage_stats.used_count,
    is_active = CASE
      WHEN c.max_uses IS NOT NULL AND usage_stats.used_count >= c.max_uses THEN false
      ELSE c.is_active
    END
  FROM (
    SELECT COUNT(*)::integer AS used_count
    FROM public.orders o
    WHERE o.coupon_id = target_coupon_id
  ) AS usage_stats
  WHERE c.id = target_coupon_id;
$$;
