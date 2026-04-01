export const BLOG_IMAGES_BUCKET = "blog-images"

export const getBlogImageUrl = (path?: string | null) => {
  if (!path) return ""

  const normalizedPath = path.trim()
  if (!normalizedPath) return ""

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!baseUrl) return ""

  return `${baseUrl}/storage/v1/object/public/${BLOG_IMAGES_BUCKET}/${normalizedPath}`
}
