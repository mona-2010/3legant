"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { Review, ReviewReply } from "@/types"

export async function getReviews(productId: string, sort: string = "newest") {
  const supabase = createClient(cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let query = supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)

  if (sort === "newest") query = query.order("created_at", { ascending: false })
  else if (sort === "oldest") query = query.order("created_at", { ascending: true })
  else if (sort === "highest") query = query.order("rating", { ascending: false })
  else if (sort === "lowest") query = query.order("rating", { ascending: true })
  else query = query.order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) return { data: null, error: error.message }

  const reviews = (data || []) as Review[]

  if (reviews.length === 0) {
    return { data: [], error: null }
  }

  const reviewIds = reviews.map((review) => review.id)

  const [likesResult, repliesResult] = await Promise.all([
    supabase
      .from("review_likes")
      .select("review_id, user_id")
      .in("review_id", reviewIds),
    supabase
      .from("review_replies")
      .select("id, review_id, user_id, user_name, user_avatar, text, created_at")
      .in("review_id", reviewIds)
      .order("created_at", { ascending: true }),
  ])

  if (likesResult.error) return { data: null, error: likesResult.error.message }
  if (repliesResult.error) return { data: null, error: repliesResult.error.message }

  const likesByReview = new Map<string, Set<string>>()
  for (const like of likesResult.data || []) {
    const set = likesByReview.get(like.review_id) || new Set<string>()
    set.add(like.user_id)
    likesByReview.set(like.review_id, set)
  }

  const repliesByReview = new Map<string, ReviewReply[]>()
  for (const reply of (repliesResult.data || []) as ReviewReply[]) {
    const list = repliesByReview.get(reply.review_id) || []
    list.push(reply)
    repliesByReview.set(reply.review_id, list)
  }

  const enrichedReviews = reviews.map((review) => {
    const likeSet = likesByReview.get(review.id) || new Set<string>()
    return {
      ...review,
      likes_count: likeSet.size,
      liked_by_me: user ? likeSet.has(user.id) : false,
      replies: repliesByReview.get(review.id) || [],
    }
  })

  return { data: enrichedReviews as Review[], error: null }
}

export async function createReview(review: {
  product_id: string
  rating: number
  text: string
}) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: "You must be logged in to write a review" }
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Anonymous"

  const userAvatar = user.user_metadata?.avatar_url || null

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: review.product_id,
      user_id: user.id,
      user_name: userName,
      user_avatar: userAvatar,
      rating: review.rating,
      text: review.text,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "You have already reviewed this product" }
    }
    return { data: null, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/shop")

  return { data: data as Review, error: null }
}

export async function updateReview(review: {
  id: string
  rating: number
  text: string
}) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: "You must be logged in to edit a review" }
  }

  const { data, error } = await supabase
    .from("reviews")
    .update({
      rating: review.rating,
      text: review.text,
    })
    .eq("id", review.id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Review, error: null }
}

export async function deleteReview(reviewId: string) {
  const supabase = createClient(cookies())

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: "You must be logged in" }
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  return { error: null }
}

export async function toggleReviewLike(reviewId: string) {
  const supabase = createClient(cookies())

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: "You must be logged in to like a review" }
  }

  const { data: existingLike, error: existingLikeError } = await supabase
    .from("review_likes")
    .select("id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingLikeError) {
    return { data: null, error: existingLikeError.message }
  }

  if (existingLike) {
    const { error } = await supabase
      .from("review_likes")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id)

    if (error) return { data: null, error: error.message }
    return { data: { liked: false }, error: null }
  }

  const { error } = await supabase.from("review_likes").insert({
    review_id: reviewId,
    user_id: user.id,
  })

  if (error) return { data: null, error: error.message }
  return { data: { liked: true }, error: null }
}

export async function createReviewReply(payload: { review_id: string; text: string }) {
  const supabase = createClient(cookies())

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { data: null, error: "You must be logged in to reply" }
  }

  const text = payload.text.trim()
  if (!text) return { data: null, error: "Reply cannot be empty" }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Anonymous"

  const userAvatar = user.user_metadata?.avatar_url || null

  const { data, error } = await supabase
    .from("review_replies")
    .insert({
      review_id: payload.review_id,
      user_id: user.id,
      user_name: userName,
      user_avatar: userAvatar,
      text,
    })
    .select("id, review_id, user_id, user_name, user_avatar, text, created_at")
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as ReviewReply, error: null }
}

export async function deleteReviewReply(replyId: string) {
  const supabase = createClient(cookies())

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be logged in to delete a reply" }
  }

  const { error } = await supabase
    .from("review_replies")
    .delete()
    .eq("id", replyId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  return { error: null }
}
