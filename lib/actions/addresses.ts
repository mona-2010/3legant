"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { UserAddress } from "@/types"

export async function getUserAddresses() {
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
}

export async function createAddress(address: Omit<UserAddress, "id" | "user_id" | "created_at" | "updated_at">) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { data: null, error: "Not authenticated" }

  // If setting as default, unset other defaults of same type
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
