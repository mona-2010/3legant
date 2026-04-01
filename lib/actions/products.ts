"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { Product, ProductCategory } from "@/types"
import { isProductNew } from "@/lib/utils/product-utils"

const PRODUCT_SELECT_FIELDS = "id,title,slug,description,short_description,measurements,weight,price,original_price,valid_until,image,images,color_mask_svg,color,category,sku,stock,is_new,is_active,created_at,updated_at,rating,review_count"

export async function getProducts(filters?: {
  category?: ProductCategory
  search?: string
  sort?: string
  limit?: number
  offset?: number
  isActive?: boolean
}) {
  const supabase = createClient(cookies())

  let query = supabase.from("products").select(PRODUCT_SELECT_FIELDS, { count: "exact" })

  if (filters?.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive)
  }

  if (filters?.category) {
    query = query.contains("category", [filters.category])
  }

  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`)
  }

  if (filters?.sort === "price_asc") query = query.order("price", { ascending: true })
  else if (filters?.sort === "price_desc") query = query.order("price", { ascending: false })
  else if (filters?.sort === "newest") query = query.order("created_at", { ascending: false })
  else query = query.order("created_at", { ascending: false })

  if (filters?.limit) query = query.limit(filters.limit)
  if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)

  const { data, error, count } = await query

  if (error) return { data: null, error: error.message, count: 0 }
  const products = (data || []).map((p: any) => ({
    ...p,
    is_new: isProductNew(p.created_at),
  })) as Product[]
  return { data: products, error: null, count }
}

export async function getProductById(id: string) {
  const supabase = createClient(cookies())
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT_FIELDS).eq("id", id).single()
  if (error) return { data: null, error: error.message }
  const product = {
    ...data,
    is_new: isProductNew(data.created_at),
  } as Product
  return { data: product, error: null }
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at" | "rating" | "review_count">) {
  const supabase = createClient(cookies())
  const normalizedProduct = {
    ...product,
    is_active: product.stock <= 0 ? false : product.is_active,
  }

  const { data, error } = await supabase.from("products").insert(normalizedProduct).select().single()
  if (error) return { data: null, error: error.message }

  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/admin/products")

  return { data: data as Product, error: null }
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const supabase = createClient(cookies())
  const { rating: _rating, review_count: _reviewCount, ...safeUpdates } = updates
  const normalizedUpdates: Partial<Product> = {
    ...safeUpdates,
    ...(safeUpdates.stock !== undefined && safeUpdates.stock <= 0 ? { is_active: false } : {}),
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...normalizedUpdates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) return { data: null, error: error.message }

  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/admin/products")
  if (data?.slug) revalidatePath(`/product/${data.slug}`)

  return { data: data as Product, error: null }
}

export async function deleteProduct(id: string) {
  const supabase = createClient(cookies())
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) return { error: error.message }

  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/admin/products")

  return { error: null }
}
