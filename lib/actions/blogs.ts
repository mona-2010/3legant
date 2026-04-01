"use server"

import { createClient } from "@/lib/supabase/server"
import { BlogPost, BlogSection } from "@/types"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { verifyAdmin } from "@/lib/actions/admin"

type BlogFilters = {
  featuredOnly?: boolean
  limit?: number
  offset?: number
}

export async function getBlogs(filters?: BlogFilters) {
  const supabase = createClient(cookies())

  let query = supabase
    .from("blogs")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false })

  if (filters?.featuredOnly) {
    query = query.eq("is_featured", true)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    const pageLimit = filters.limit || 10
    query = query.range(filters.offset, filters.offset + pageLimit - 1)
  }

  const { data, error } = await query

  if (error) return { data: null, error: error.message }
  return { data: (data || []) as BlogPost[], error: null }
}

export async function getBlogBySlug(slug: string) {
  const supabase = createClient(cookies())

  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as BlogPost, error: null }
}

type BlogWriteInput = {
  title: string
  slug: string
  excerpt?: string
  content?: string
  cover_image?: string
  cover_image_path?: string
  gallery_image_paths?: string[]
  sections?: BlogSection[]
  author?: string
  published_at?: string | null
  is_published?: boolean
  is_featured?: boolean
}

const normalizeSections = (sections?: BlogSection[]) => {
  if (!sections || sections.length === 0) return []

  return sections.slice(0, 5).map((section) => ({
    heading: section.heading || "",
    paragraph: section.paragraph || "",
  }))
}

export async function getAdminBlogs() {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { data: null, error: "Not authorized" }

  const supabase = createClient(cookies())
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: (data || []) as BlogPost[], error: null }
}

export async function createBlog(input: BlogWriteInput) {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { data: null, error: "Not authorized" }

  const supabase = createClient(cookies())
  const { data, error } = await supabase
    .from("blogs")
    .insert({
      title: input.title,
      slug: input.slug,
      excerpt: input.excerpt || "",
      content: input.content || "",
      cover_image: input.cover_image || "",
      cover_image_path: input.cover_image_path || "",
      gallery_image_paths: input.gallery_image_paths || [],
      sections: normalizeSections(input.sections),
      author: input.author || "",
      published_at: input.published_at || new Date().toISOString(),
      is_published: input.is_published ?? false,
      is_featured: input.is_featured ?? false,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath("/")
  revalidatePath("/blog")
  revalidatePath("/admin/blog")
  revalidatePath(`/blog/${data.slug}`)

  return { data: data as BlogPost, error: null }
}

export async function updateBlog(id: string, input: Partial<BlogWriteInput>) {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { data: null, error: "Not authorized" }

  const supabase = createClient(cookies())
  const { data: existing } = await supabase
    .from("blogs")
    .select("slug")
    .eq("id", id)
    .maybeSingle()

  const { data, error } = await supabase
    .from("blogs")
    .update({
      ...input,
      ...(input.sections ? { sections: normalizeSections(input.sections) } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }

  revalidatePath("/")
  revalidatePath("/blog")
  revalidatePath("/admin/blog")
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`)
  if (data?.slug) revalidatePath(`/blog/${data.slug}`)

  return { data: data as BlogPost, error: null }
}

export async function deleteBlog(id: string) {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { error: "Not authorized" }

  const supabase = createClient(cookies())
  const { data: existing } = await supabase
    .from("blogs")
    .select("slug")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase.from("blogs").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/")
  revalidatePath("/blog")
  revalidatePath("/admin/blog")
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`)

  return { error: null }
}