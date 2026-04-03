"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { cache } from "react"
import { UserAddress } from "@/types"
import { saveOrderAddresses } from "./order-addresses"

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
  const supabase = createClient(cookies())

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

  console.log(`[AddressSync] Starting sync for ${orders.length} orders for user ${user.id}`)

  for (const order of orders) {
    if (order.user_info) {
      await saveOrderAddresses(supabase, user.id, order.id, order.user_info as any)
    }
  }

  return { success: true }
}

export async function createAddress(address: Omit<UserAddress, "id" | "user_id" | "created_at" | "updated_at">) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  if (address.is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("type", address.type)
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

  if (updates.is_default) {
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("type", updates.type || "billing")
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

  const { error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  return { error: null }
}
