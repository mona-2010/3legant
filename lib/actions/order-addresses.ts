import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { OrderUserInfo } from "@/types"

export async function saveOrderAddresses(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  orderId: string,
  userInfo: OrderUserInfo
) {
  const shipping = userInfo.shipping
  const billing = userInfo.billing

  const adminClient = createAdminClient()

  const { data: existingAddr, error: searchError } = await adminClient
    .from("user_addresses")
    .select("id")
    .eq("user_id", userId)
    .eq("street_address", shipping.street_address)
    .eq("city", shipping.city)
    .eq("zip_code", shipping.zip_code || "")
    .eq("type", "shipping")
    .maybeSingle()

  if (searchError) console.error("[AddressSync] Shipping search error:", searchError.message)

  let shippingAddressId = existingAddr?.id || null
  if (!existingAddr) {
    const { data: anyAddr } = await adminClient
      .from("user_addresses")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "shipping")
      .limit(1)

    const { data: newShipping, error: insertError } = await adminClient.from("user_addresses").insert({
      user_id: userId,
      type: "shipping",
      first_name: shipping.first_name || "N/A",
      last_name: shipping.last_name || "N/A",
      phone: shipping.phone || userInfo.phone || "",
      street_address: shipping.street_address,
      city: shipping.city,
      state: shipping.state || "",
      zip_code: shipping.zip_code || "",
      country: shipping.country,
      is_default: !anyAddr || anyAddr.length === 0,
    }).select("id").single()

    if (insertError) {
      console.error("[AddressSync] Shipping insert failed:", insertError.message)
    } else {
      shippingAddressId = newShipping?.id || null
      console.log(`[AddressSync] Created new shipping address ${shippingAddressId} for user ${userId}`)
    }
  }

  // 2. Handle Billing Address
  let billingAddressId = null
  if (billing?.street_address) {
    const { data: existingBilling, error: billSearchError } = await adminClient
      .from("user_addresses")
      .select("id")
      .eq("user_id", userId)
      .eq("street_address", billing.street_address)
      .eq("city", billing.city)
      .eq("type", "billing")
      .maybeSingle()

    if (billSearchError) console.error("[AddressSync] Billing search error:", billSearchError.message)

    billingAddressId = existingBilling?.id || null
    if (!existingBilling) {
      const { data: anyBilling } = await adminClient
        .from("user_addresses")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "billing")
        .limit(1)

      const { data: newBilling, error: billInsertError } = await adminClient.from("user_addresses").insert({
        user_id: userId,
        type: "billing",
        first_name: billing.first_name || "N/A",
        last_name: billing.last_name || "N/A",
        phone: billing.phone || userInfo.phone || "",
        street_address: billing.street_address,
        city: billing.city,
        state: billing.state || "",
        zip_code: billing.zip_code || "",
        country: billing.country,
        is_default: !anyBilling || anyBilling.length === 0,
      }).select("id").single()

      if (billInsertError) {
        console.error("[AddressSync] Billing insert failed:", billInsertError.message)
      } else {
        billingAddressId = newBilling?.id || null
        console.log(`[AddressSync] Created new billing address ${billingAddressId} for user ${userId}`)
      }
    }
  }

  const updates: any = {
    updated_at: new Date().toISOString(),
  }
  if (shippingAddressId) updates.shipping_address_id = shippingAddressId
  if (billingAddressId) updates.billing_address_id = billingAddressId

  if (Object.keys(updates).length > 1) {
    const { error: errorLink } = await adminClient
      .from("orders")
      .update(updates)
      .eq("id", orderId)
    
    if (errorLink) console.error("[AddressSync] Linking error:", errorLink)
  }
}
