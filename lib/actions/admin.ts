"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function verifyAdmin() {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { isAdmin: false, isAuthenticated: false, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (error || !data) return { isAdmin: false, isAuthenticated: true, error: "Role not found" }
  if (data.role !== "admin") return { isAdmin: false, isAuthenticated: true, error: "Not authorized" }

  return { isAdmin: true, isAuthenticated: true, role: data.role, error: null }
}

export async function getUserRole() {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { role: null, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (error || !data) return { role: "user", error: null }
  return { role: data.role as "user" | "admin", error: null }
}

export async function getAdminDashboardStats() {
  const supabase = createClient(cookies())

  const [
    { count: totalProducts },
    { count: totalOrders },
    { data: revenueData },
    { count: totalUsers },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_price").eq("status", "delivered"),
    supabase.from("orders").select("user_id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const totalRevenue = revenueData?.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0) || 0

  return {
    totalProducts: totalProducts || 0,
    totalOrders: totalOrders || 0,
    totalRevenue,
    totalUsers: totalUsers || 0,
    recentOrders: recentOrders || [],
  }
}

export async function getAdminUsers() {
  const supabase = createClient(cookies())
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  if (error) return { data: null, error: error.message }
  return { data: users, error: null }
}
