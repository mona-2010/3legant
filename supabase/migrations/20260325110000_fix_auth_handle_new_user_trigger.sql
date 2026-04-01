-- Harden auth signup hook to avoid "Database error saving new user"
-- when profile/cart sync logic drifts from schema changes.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_username text;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  v_username := COALESCE(
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'user_name',
    NEW.raw_user_meta_data ->> 'display_name',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  -- Try the most complete profile insert first.
  BEGIN
    INSERT INTO public.profiles (id, full_name, username)
    VALUES (NEW.id, v_full_name, v_username)
    ON CONFLICT (id) DO UPDATE
    SET
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      username = COALESCE(EXCLUDED.username, public.profiles.username);
  EXCEPTION
    WHEN undefined_column THEN
      -- Fallback for schemas without username column.
      BEGIN
        INSERT INTO public.profiles (id, full_name)
        VALUES (NEW.id, v_full_name)
        ON CONFLICT (id) DO UPDATE
        SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
      EXCEPTION
        WHEN undefined_column THEN
          -- Final fallback for minimal profiles table.
          INSERT INTO public.profiles (id)
          VALUES (NEW.id)
          ON CONFLICT (id) DO NOTHING;
      END;
  END;

  -- Create empty user cart if schema supports user_id-only cart rows.
  BEGIN
    INSERT INTO public.cart (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION
    WHEN undefined_table OR undefined_column OR not_null_violation THEN
      NULL;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
