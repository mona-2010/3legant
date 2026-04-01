"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { verifyAdmin } from "@/lib/actions/admin"
import { ContactMessage } from "@/types"

type ContactInput = {
  fullName: string
  email: string
  message: string
}

export async function submitContactMessage(input: ContactInput) {
  const fullName = input.fullName.trim()
  const email = input.email.trim().toLowerCase()
  const message = input.message.trim()

  if (!fullName || fullName.length < 2) {
    return { error: "Please enter a valid full name." }
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please enter a valid email address." }
  }

  if (!message || message.length < 10) {
    return { error: "Please enter a message with at least 10 characters." }
  }

  const supabase = createClient(cookies())
  const { error } = await supabase.from("contact").insert({
    full_name: fullName,
    email,
    message,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/contact")
  return { error: null }
}

export async function getAdminContactMessages(limit = 200) {
  const adminStatus = await verifyAdmin()
  if (!adminStatus.isAdmin) {
    return { data: null, error: "Not authorized" }
  }

  const supabase = createClient(cookies())
  const { data, error } = await supabase
    .from("contact")
    .select("id, full_name, email, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: (data || []) as ContactMessage[], error: null }
}

export async function deleteAdminContactMessage(contactId: string) {
  const adminStatus = await verifyAdmin()
  if (!adminStatus.isAdmin) {
    return { error: "Not authorized" }
  }

  if (!contactId) {
    return { error: "Contact id is required." }
  }

  const supabase = createClient(cookies())
  const { error } = await supabase.from("contact").delete().eq("id", contactId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/contact")
  return { error: null }
}
