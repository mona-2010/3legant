import { createClient } from "@/lib/supabase/client"
import { CartItem } from "@/types/index"

const CART_FETCH_TTL_MS = 1200
const cartFetchInFlightByUser = new Map<string, Promise<CartItem[]>>()
const cartFetchCacheByUser = new Map<string, { items: CartItem[]; at: number }>()

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

  const request = (async () => {
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        color,
        product_id,
        cart!inner (
          user_id
        ),
        products (
          id,
          title,
          price,
          image,
          stock
        )
      `)
      .eq("cart.user_id", resolvedUserId)

    if (error || !data) {
      return []
    }

    const items = data.map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      name: item.products.title,
      price: item.products.price,
      image: item.products.image,
      stock: item.products.stock,
      quantity: item.quantity,
      color: item.color || undefined
    }))

    cartFetchCacheByUser.set(resolvedUserId, { items, at: Date.now() })
    return items
  })()

  cartFetchInFlightByUser.set(resolvedUserId, request)
  try {
    return await request
  } finally {
    cartFetchInFlightByUser.delete(resolvedUserId)
  }
}