"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { verifyAdmin } from "./admin"

export async function getStoreSettings() {
  const supabase = createClient(cookies())
  const { data, error } = await supabase
    .from("store_settings")
    .select("key, value")

  if (error) return { data: null, error: error.message }

  const settings: Record<string, any> = {}
  data.forEach((s) => {
    settings[s.key] = s.value
  })

  return { data: settings, error: null }
}

export async function updateStoreSetting(key: string, value: any) {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { error: "Not authorized" }

  const supabase = createClient(cookies())
  const { error } = await supabase
    .from("store_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() })

  if (error) return { error: error.message }

  revalidatePath("/admin/settings")
  return { error: null }
}
