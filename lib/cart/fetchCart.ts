import { createClient } from "@/lib/supabase/client"
import { CartItem } from "@/types/index"
import { getEffectiveProductPrice } from "@/lib/utils/product-pricing"

const CART_FETCH_TTL_MS = 1200
const cartFetchInFlightByUser = new Map<string, Promise<CartItem[]>>()
const cartFetchCacheByUser = new Map<string, { items: CartItem[]; at: number }>()
const lastInvalidatedAtByUser = new Map<string, number>()

export async function fetchCart(userId?: string): Promise<CartItem[]> {
  const supabase = createClient()
  let resolvedUserId = userId

  if (!resolvedUserId) {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    resolvedUserId = user?.id
  }

  if (!resolvedUserId) return []

  const now = Date.now()
  const cached = cartFetchCacheByUser.get(resolvedUserId)
  if (cached && now - cached.at < CART_FETCH_TTL_MS) {
    return cached.items
  }

  const inFlight = cartFetchInFlightByUser.get(resolvedUserId)
  if (inFlight) {
    return inFlight
  }

  const requestStartTime = Date.now()
  const request = (async () => {
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        product_id,
        quantity,
        color,
        product:products (
          id,
          title,
          price,
          original_price,
          valid_until,
          image,
          stock,
          is_active
        ),
        cart!inner (
          user_id
        )
      `)
      .eq("cart.user_id", resolvedUserId)

    if (error) {
      return []
    }

    const items: CartItem[] = (data || []).map((row: any) => ({
      id: row.id,
      product_id: row.product_id,
      name: row.product?.title || "Unknown Product",
      image: row.product?.image || "",
      price: getEffectiveProductPrice({
        price: row.product?.price || 0,
        original_price: row.product?.original_price,
        valid_until: row.product?.valid_until,
      }),
      quantity: row.quantity,
      color: row.color,
      stock: row.product?.stock,
    }))

    const lastInvalidated = lastInvalidatedAtByUser.get(resolvedUserId) || 0
    if (lastInvalidated < requestStartTime) {
      cartFetchCacheByUser.set(resolvedUserId, { items, at: Date.now() })
    } else {
    }
    return items
  })()

  cartFetchInFlightByUser.set(resolvedUserId, request)
  try {
    return await request
  } finally {
    cartFetchInFlightByUser.delete(resolvedUserId)
  }
}

/**
 * Force clear the client-side cart fetch cache for a specific user.
 * Use this after any database cart mutation to ensure subsequent fetches are fresh.
 */
export function invalidateCartCache(userId: string) {
  if (!userId) return

  lastInvalidatedAtByUser.set(userId, Date.now())
  const deletedCache = cartFetchCacheByUser.delete(userId)
  const deletedInFlight = cartFetchInFlightByUser.delete(userId)
  
  if (deletedCache || deletedInFlight) {
  }
}