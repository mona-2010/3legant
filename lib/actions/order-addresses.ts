import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { OrderUserInfo } from "@/types"
import { getAddressSignature } from "./address-utils"

type SaveOrderAddressesOptions = {
  deletedSignatures?: Set<string>
}

export async function saveOrderAddresses(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  orderId: string,
  userInfo: OrderUserInfo,
  options?: SaveOrderAddressesOptions
) {
  const shipping = userInfo.shipping
  const billing = userInfo.billing
  const deletedSignatures = options?.deletedSignatures || new Set<string>()

  const adminClient = createAdminClient()

  const { data: shippingAddresses, error: searchError } = await adminClient
    .from("user_addresses")
    .select("id, street_address, city, state, zip_code, country")
    .eq("user_id", userId)
  
  const shippingSignature = getAddressSignature(shipping)
  const existingAddr = (shippingAddresses || []).find(
    (address) => getAddressSignature(address) === shippingSignature
  )

  if (searchError) console.error("[AddressSync] Shipping search error:", searchError.message)

  let shippingAddressId = existingAddr?.id || null
  if (!existingAddr && !deletedSignatures.has(shippingSignature)) {
    const { data: anyAddr } = await adminClient
      .from("user_addresses")
      .select("id")
      .eq("user_id", userId)
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
    }
  }

  let billingAddressId = null
  if (billing?.street_address) {
    const { data: billingAddresses, error: billSearchError } = await adminClient
      .from("user_addresses")
      .select("id, street_address, city, state, zip_code, country")
      .eq("user_id", userId)

    const billingSignature = getAddressSignature(billing)
    const existingBilling = (billingAddresses || []).find(
      (address) => getAddressSignature(address) === billingSignature
    )

    if (billSearchError) console.error("[AddressSync] Billing search error:", billSearchError.message)

    billingAddressId = existingBilling?.id || null
    if (!existingBilling && !deletedSignatures.has(billingSignature)) {
      const { data: anyBilling } = await adminClient
        .from("user_addresses")
        .select("id")
        .eq("user_id", userId)
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
