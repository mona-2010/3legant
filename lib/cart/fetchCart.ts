import { createClient } from "@/lib/supabase/client"
import { CartItem } from "@/types/cart"

export async function fetchCart(): Promise<CartItem[]> {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("cart")
    .select(`
      id,
      quantity,
      products (
        title,
        price,
        image,
        color
      )
    `)
    .eq("user_id", user.id)

  if (error || !data) return []

  return data.map((item: any) => ({
    id: item.id,
    name: item.products.title,
    price: item.products.price,
    image: item.products.image,
    quantity: item.quantity,
    color: item.products.color
  }))
}