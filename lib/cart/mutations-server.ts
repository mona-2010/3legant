import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Shared server-side function to clear a user's cart in the database.
 * Can be called with either an Admin client (webhook) or a Server client (actions).
 */
export async function clearCartByUserId(supabase: any, userId: string) {
  try {
    if (!userId || userId === "guest") {
      console.warn(`[CartClear] Attempted to clear cart for invalid or guest user: ${userId}`)
      return { success: false, error: "Invalid user ID" }
    }

    console.log(`[CartClear] Initiating "nuclear" clear for user ${userId}...`)

    // Delete the root cart record. This will CASCADE delete all cart_items.
    const { error: deleteError, count } = await supabase
      .from("cart")
      .delete({ count: "exact" })
      .eq("user_id", userId)

    if (deleteError) {
      console.error(`[CartClear] Failed to delete cart record for user ${userId}:`, deleteError.message)
      
      // Fallback: Try deleting from cart_items directly if cart delete failed but record exists
      console.log(`[CartClear] Attempting fallback deletion from cart_items...`)
      await supabase.from("cart_items").delete().match({ user_id: userId }) // This depends on schema, let's stick to cart_id joining if we have it
      
      return { success: false, error: deleteError.message }
    }

    console.log(`[CartClear] Success! Deleted ${count || 0} cart records (and all cascaded items) for user ${userId}`)
    return { success: true }
  } catch (err: any) {
    console.error(`[CartClear] Unexpected critical error for user ${userId}:`, err.message)
    return { success: false, error: err.message }
  }
}
