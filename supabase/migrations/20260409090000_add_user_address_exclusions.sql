-- Persist deleted addresses so historical order sync never re-imports them.

CREATE TABLE IF NOT EXISTS public.user_address_exclusions (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_signature text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, address_signature)
);

ALTER TABLE public.user_address_exclusions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their deleted addresses" ON public.user_address_exclusions;
CREATE POLICY "Users can manage their deleted addresses"
ON public.user_address_exclusions
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.delete_user_address_and_store_exclusion(p_address_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_street text;
  deleted_city text;
  deleted_state text;
  deleted_zip text;
  deleted_country text;
  deleted_signature text;
BEGIN
  DELETE FROM public.user_addresses
  WHERE id = p_address_id
    AND user_id = auth.uid()
  RETURNING street_address, city, state, zip_code, country
  INTO deleted_street, deleted_city, deleted_state, deleted_zip, deleted_country;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Address not found';
  END IF;

  deleted_signature := lower(regexp_replace(coalesce(trim(deleted_street), ''), '[[:space:]]+', ' ', 'g'))
    || '|' || lower(regexp_replace(coalesce(trim(deleted_city), ''), '[[:space:]]+', ' ', 'g'))
    || '|' || lower(regexp_replace(coalesce(trim(deleted_state), ''), '[[:space:]]+', ' ', 'g'))
    || '|' || lower(regexp_replace(coalesce(trim(deleted_zip), ''), '[[:space:]]+', ' ', 'g'))
    || '|' || lower(regexp_replace(coalesce(trim(deleted_country), ''), '[[:space:]]+', ' ', 'g'));

  INSERT INTO public.user_address_exclusions (user_id, address_signature)
  VALUES (auth.uid(), deleted_signature)
  ON CONFLICT (user_id, address_signature) DO NOTHING;
END;
$$;
