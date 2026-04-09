"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { cache } from "react"
import { UserAddress } from "@/types"
import { saveOrderAddresses } from "./order-addresses"
import { getAddressSignature, hasDuplicateAddress } from "./address-utils"

// In-memory cache to prevent duplicate syncs in the same session
const syncedUsers = new Set<string>()

// Memoize getUserAddresses at request level to deduplicate calls within same render
const getUserAddressesInternal = cache(async () => {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: data as UserAddress[], error: null }
})

export async function getUserAddresses() {
  return getUserAddressesInternal()
}

export async function syncMissingAddressesFromOrders() {
  const cookieStorePromise = cookies()
  const supabase = createClient(cookieStorePromise)

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: "Not authenticated" }

  // Skip if already synced in this session
  if (syncedUsers.has(user.id)) {
    return { success: true, skipped: true }
  }

  syncedUsers.add(user.id)

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, user_info")
    .eq("user_id", user.id)

  if (ordersError) {
    console.error("[AddressSync] Failed to fetch orders for sync:", ordersError.message)
    return { success: false, error: ordersError.message }
  }

  if (!orders || orders.length === 0) return { success: true }

  const { data: deletedAddresses, error: deletedError } = await supabase
    .from("user_address_exclusions")
    .select("address_signature")
    .eq("user_id", user.id)

  if (deletedError) {
    console.error("[AddressSync] Failed to fetch deleted address exclusions:", deletedError.message)
    return { success: false, error: deletedError.message }
  }

  const deletedSignatures = new Set(
    (deletedAddresses || []).map((row) => row.address_signature)
  )

  console.log(`[AddressSync] Starting sync for ${orders.length} orders for user ${user.id}`)

  for (const order of orders) {
    if (order.user_info) {
      await saveOrderAddresses(supabase, user.id, order.id, order.user_info as any, {
        deletedSignatures,
      })
    }
  }

  return { success: true }
}

export async function createAddress(address: Omit<UserAddress, "id" | "user_id" | "created_at" | "updated_at">) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  const { data: existingAddresses, error: existingError } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)

  if (existingError) return { data: null, error: existingError.message }

  if (hasDuplicateAddress(address, (existingAddresses || []) as UserAddress[])) {
    return { data: null, error: "Address already exists" }
  }

  if (address.is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .insert({ ...address, user_id: user.id })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as UserAddress, error: null }
}

export async function updateAddress(id: string, updates: Partial<Omit<UserAddress, "id" | "user_id">>) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  const { data: currentAddress, error: currentError } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (currentError) return { data: null, error: currentError.message }

  const mergedAddress = {
    ...currentAddress,
    ...updates,
  }

  const { data: existingAddresses, error: existingError } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.id)

  if (existingError) return { data: null, error: existingError.message }

  if (hasDuplicateAddress(mergedAddress, (existingAddresses || []) as UserAddress[], id)) {
    return { data: null, error: "Address already exists" }
  }

  if (updates.is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as UserAddress, error: null }
}

export async function deleteAddress(id: string) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  const { data: targetAddress, error: targetError } = await supabase
    .from("user_addresses")
    .select("id, user_id, street_address, city, state, zip_code, country, is_default")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (targetError) return { error: targetError.message }

  const { error: deleteError } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (deleteError) return { error: deleteError.message }

  const addressSignature = getAddressSignature(targetAddress)
  const { error: exclusionError } = await supabase
    .from("user_address_exclusions")
    .upsert({
      user_id: user.id,
      address_signature: addressSignature,
    }, { onConflict: "user_id,address_signature" })

  if (exclusionError) {
    console.error("[AddressDelete] Failed to store address exclusion:", exclusionError.message)
  }

  if (targetAddress.is_default) {
    const { data: nextAddress, error: nextAddressError } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (nextAddressError) return { error: nextAddressError.message }

    if (nextAddress?.id) {
      const { error: defaultError } = await supabase
        .from("user_addresses")
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq("id", nextAddress.id)
        .eq("user_id", user.id)

      if (defaultError) return { error: defaultError.message }
    }
  }

  return { error: null }
}
