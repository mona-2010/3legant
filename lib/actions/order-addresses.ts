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

  // 1. Handle Shipping Address
  const { data: existingAddr } = await supabase
    .from("user_addresses")
    .select("id")
    .eq("user_id", userId)
    .eq("street_address", shipping.street_address)
    .eq("city", shipping.city)
    .eq("zip_code", shipping.zip_code || "")
    .eq("type", "shipping")
    .maybeSingle()

  let shippingAddressId = existingAddr?.id || null
  if (!existingAddr) {
    const { data: anyAddr } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("user_id", userId)
      .eq("type", "shipping")
      .limit(1)

    const { data: newShipping } = await supabase.from("user_addresses").insert({
      user_id: userId,
      type: "shipping",
      first_name: shipping.first_name,
      last_name: shipping.last_name,
      phone: shipping.phone || "",
      street_address: shipping.street_address,
      city: shipping.city,
      state: shipping.state || "",
      zip_code: shipping.zip_code || "",
      country: shipping.country,
      is_default: !anyAddr || anyAddr.length === 0,
    }).select("id").single()

    shippingAddressId = newShipping?.id || null
  }

  // 2. Handle Billing Address
  let billingAddressId = null
  if (billing?.street_address) {
    const { data: existingBilling } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("user_id", userId)
      .eq("street_address", billing.street_address)
      .eq("city", billing.city)
      .eq("type", "billing")
      .maybeSingle()

    billingAddressId = existingBilling?.id || null
    if (!existingBilling) {
      const { data: anyBilling } = await supabase
        .from("user_addresses")
        .select("id")
        .eq("user_id", userId)
        .eq("type", "billing")
        .limit(1)

      const { data: newBilling } = await supabase.from("user_addresses").insert({
        user_id: userId,
        type: "billing",
        first_name: billing.first_name,
        last_name: billing.last_name,
        phone: billing.phone || "",
        street_address: billing.street_address,
        city: billing.city,
        state: billing.state || "",
        zip_code: billing.zip_code || "",
        country: billing.country,
        is_default: !anyBilling || anyBilling.length === 0,
      }).select("id").single()

      billingAddressId = newBilling?.id || null
    }
  }

  // 3. Link addresses to the order
  // Using admin client to bypass restrictive RLS on orders table
  const adminClient = createAdminClient()
  const updates: any = {
    updated_at: new Date().toISOString(),
  }
  if (shippingAddressId) updates.shipping_address_id = shippingAddressId
  if (billingAddressId) updates.billing_address_id = billingAddressId

  if (Object.keys(updates).length > 1) {
    await adminClient
      .from("orders")
      .update(updates)
      .eq("id", orderId)
  }
}
