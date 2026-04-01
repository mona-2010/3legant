-- Blog storage bucket + structured blog detail schema

-- 0) Baseline blog table policy/index sync for already-applied base migrations
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published blogs" ON public.blogs;
CREATE POLICY "Public can read published blogs"
  ON public.blogs FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "Admins can create, update, and delete blogs" ON public.blogs;

DROP POLICY IF EXISTS "Admins can insert blogs" ON public.blogs;
CREATE POLICY "Admins can insert blogs"
  ON public.blogs FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update blogs" ON public.blogs;
CREATE POLICY "Admins can update blogs"
  ON public.blogs FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete blogs" ON public.blogs;
CREATE POLICY "Admins can delete blogs"
  ON public.blogs FOR DELETE
  USING (public.is_admin());

DROP INDEX IF EXISTS public.blogs_slug_idx;
CREATE INDEX IF NOT EXISTS blogs_published_at_idx
  ON public.blogs (published_at DESC)
  WHERE is_published = TRUE;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blogs_set_updated_at ON public.blogs;
CREATE TRIGGER blogs_set_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 1) Dedicated public bucket for blog images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read access for blog images
DROP POLICY IF EXISTS "Public can read blog images" ON storage.objects;
CREATE POLICY "Public can read blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- Admin-only write access for blog images
DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'blog-images' AND public.is_admin())
WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'blog-images' AND public.is_admin());

-- 2) Structured blog content (1 cover image + gallery image array + 5 sections as JSONB)
ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS cover_image_path TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS gallery_image_paths TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '[]'::jsonb;

-- If older section columns exist locally, migrate them into sections JSONB and remove them.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'blogs'
      AND column_name = 'section_1_heading'
  ) THEN
    EXECUTE $sql$
      UPDATE public.blogs
      SET sections = jsonb_build_array(
        jsonb_build_object('heading', section_1_heading, 'paragraph', section_1_paragraph),
        jsonb_build_object('heading', section_2_heading, 'paragraph', section_2_paragraph),
        jsonb_build_object('heading', section_3_heading, 'paragraph', section_3_paragraph),
        jsonb_build_object('heading', section_4_heading, 'paragraph', section_4_paragraph),
        jsonb_build_object('heading', section_5_heading, 'paragraph', section_5_paragraph)
      )
      WHERE coalesce(section_1_heading, '') <> ''
         OR coalesce(section_1_paragraph, '') <> ''
         OR coalesce(section_2_heading, '') <> ''
         OR coalesce(section_2_paragraph, '') <> ''
         OR coalesce(section_3_heading, '') <> ''
         OR coalesce(section_3_paragraph, '') <> ''
         OR coalesce(section_4_heading, '') <> ''
         OR coalesce(section_4_paragraph, '') <> ''
         OR coalesce(section_5_heading, '') <> ''
         OR coalesce(section_5_paragraph, '') <> '';
    $sql$;

    EXECUTE $sql$
      ALTER TABLE public.blogs
      DROP COLUMN IF EXISTS section_1_heading,
      DROP COLUMN IF EXISTS section_1_paragraph,
      DROP COLUMN IF EXISTS section_2_heading,
      DROP COLUMN IF EXISTS section_2_paragraph,
      DROP COLUMN IF EXISTS section_3_heading,
      DROP COLUMN IF EXISTS section_3_paragraph,
      DROP COLUMN IF EXISTS section_4_heading,
      DROP COLUMN IF EXISTS section_4_paragraph,
      DROP COLUMN IF EXISTS section_5_heading,
      DROP COLUMN IF EXISTS section_5_paragraph;
    $sql$;
  END IF;
END $$;
