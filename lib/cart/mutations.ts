import { createClient } from "@/lib/supabase/client"
import { invalidateCartCache } from "./fetchCart"

type AddCartItemInput = {
  userId: string
  productId: string
  quantity?: number
  color?: string | null
}

type CartMutationRow = {
  id: string
  product_id: string
  quantity: number
  color: string | null
}

async function getOrCreateCartId(userId: string): Promise<string | null> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from("cart")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (existing?.id) return existing.id

  const { data: created, error } = await supabase
    .from("cart")
    .insert({ user_id: userId })
    .select("id")
    .single()

  if (error || !created?.id) return null
  return created.id
}

function withColorFilter(query: any, color: string | null) {
  return color === null ? query.is("color", null) : query.eq("color", color)
}

export async function addItemToCart(input: AddCartItemInput): Promise<{ success: boolean; item: CartMutationRow | null }> {
  const supabase = createClient()
  const cartId = await getOrCreateCartId(input.userId)
  if (!cartId) return { success: false, item: null }

  const color = input.color ?? null
  const quantity = Math.max(1, input.quantity ?? 1)

  const { data: product } = await supabase
    .from("products")
    .select("stock, is_active")
    .eq("id", input.productId)
    .maybeSingle()

  if (!product?.is_active) return { success: false, item: null }
  if (typeof product.stock === "number") {
    const { data: cartRows } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("cart_id", cartId)
      .eq("product_id", input.productId)

    const currentQty = (cartRows ?? []).reduce(
      (sum: number, row: { quantity?: number }) => sum + (row.quantity ?? 0),
      0
    )

    if (currentQty + quantity > product.stock) return { success: false, item: null }
  }

  let existingQuery = supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", input.productId)

  existingQuery = withColorFilter(existingQuery, color)
  const { data: existing } = await existingQuery.maybeSingle()

  if (existing?.id) {
    const { data, error } = await supabase
      .from("cart_items")
      .update({
        quantity: existing.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("id, product_id, quantity, color")
      .single()

    return error || !data
      ? { success: false, item: null }
      : { success: true, item: data as CartMutationRow }
  }

  const { data, error } = await supabase.from("cart_items").insert({
    cart_id: cartId,
    product_id: input.productId,
    quantity,
    color,
  }).select("id, product_id, quantity, color").single()

  if (!error) {
    invalidateCartCache(input.userId)
  }

  return error || !data
    ? { success: false, item: null }
    : { success: true, item: data as CartMutationRow }
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq("id", itemId)

  return !error
}

export async function removeCartItem(itemId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId)

  return !error
}
