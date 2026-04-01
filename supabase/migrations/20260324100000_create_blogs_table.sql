-- ============================================================
-- Blogs table - BASE DEF ONLY (policies/bucket in migration 20260324113000)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blogs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  excerpt       TEXT NOT NULL DEFAULT '',
  content       TEXT NOT NULL DEFAULT '',      -- MDX / Markdown content
  cover_image   TEXT NOT NULL DEFAULT '',      -- URL to cover image
  author        TEXT NOT NULL DEFAULT '',
  published_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Sample blog post (optional, remove if not needed)
-- ============================================================
INSERT INTO public.blogs (title, slug, excerpt, content, cover_image, author, published_at, is_published, is_featured)
VALUES (
  'How to make a busy bathroom a place to relax',
  'how-to-make-a-busy-bathroom-a-place-to-relax',
  'Your bathroom serves a string of busy functions on a daily basis. See how you can make all of them work, and still have room for comfort and relaxation.',
  E'## A cleaning hub with built-in ventilation\n\nUse a rod and a shower curtain to create a complement to your cleaning cupboard. Unsightly equipment is stored out of sight yet accessibly close – while the air flow helps dry any dampness.\n\n## Storage with a calming effect\n\nHaving a lot to store doesn''t mean it all has to go in a cupboard. Many bathroom items are better kept out in the open – either to be close at hand or are nice to look at. Add a plant or two to set a calm mood for the entire room.\n\n## Kit your clutter for easy access\n\nEven if you have a cabinet ready to swallow the clutter, it''s worth resisting a little. Let containers hold kits for different activities – home spa, make-up, personal hygiene – to bring out or put back at a moment''s notice.\n\n## An ecosystem of towels\n\nRacks or hooks that allow air to circulate around each towel prolong their freshness. They dry quick and the need for frequent washing is minimized.',
  'https://akwlfwaubucratjbekch.supabase.co/storage/v1/object/public/media/blog-cover.jpg',
  'Henrik Annemark',
  '2023-10-16T00:00:00Z',
  TRUE,
  TRUE
)
ON CONFLICT (slug) DO NOTHING;
