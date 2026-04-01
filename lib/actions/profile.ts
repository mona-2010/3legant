"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function updateUserProfile(data: {
  fullName: string
  displayName?: string
  avatarUrl?: string
}) {
  try {
    const supabase = createClient(cookies())

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching current profile:", fetchError)
    }

    const updatePayload: any = {
      id: user.id,
      full_name: data.fullName,
    }

    if (data.avatarUrl) {
      updatePayload.avatar_url = data.avatarUrl
    }

    if (currentProfile?.role) {
      updatePayload.role = currentProfile.role
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(updatePayload)

    if (profileError) {
      console.error("Profile update error:", profileError)
      return { success: false, error: `Failed to update profile: ${profileError.message}` }
    }

    const updateData: Record<string, string> = {
      full_name: data.fullName,
    }

    if (data.displayName) {
      updateData.display_name = data.displayName
    }

    if (data.avatarUrl) {
      updateData.avatar_url = data.avatarUrl
    }

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: updateData,
    })

    if (authUpdateError) {
      console.error("Auth update error:", authUpdateError)
      return { success: false, error: `Failed to update auth: ${authUpdateError.message}` }
    }

    return { success: true, error: null }
  } catch (err) {
    console.error("Unexpected error updating profile:", err)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function uploadAvatarAndUpdateProfile(avatarUrl: string) {
  try {
    const supabase = createClient(cookies())

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching current profile:", fetchError)
    }

    const updatePayload: any = {
      id: user.id,
      avatar_url: avatarUrl,
    }

    if (currentProfile?.role) {
      updatePayload.role = currentProfile.role
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(updatePayload)

    if (profileError) {
      return { success: false, error: `Failed to update avatar in profile: ${profileError.message}` }
    }

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    })

    if (authUpdateError) {
      return { success: false, error: `Failed to update avatar in auth: ${authUpdateError.message}` }
    }

    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: "An unexpected error occurred" }
  }
}
