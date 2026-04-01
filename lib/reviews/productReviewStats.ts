import { SupabaseClient } from "@supabase/supabase-js"

type ProductWithId = {
  id: string
  rating?: number
  review_count?: number
}

type ReviewAggregateRow = {
  product_id: string
  rating: number
}

export async function attachProductReviewStats<T extends ProductWithId>(
  supabase: SupabaseClient,
  products: T[]
): Promise<T[]> {
  if (!products.length) return products

  const productIds = Array.from(new Set(products.map((product) => product.id)))
  const { data, error } = await supabase
    .from("reviews")
    .select("product_id, rating")
    .in("product_id", productIds)

  if (error || !data) {
    return products.map((product) => ({
      ...product,
      rating: 0,
      review_count: 0,
    }))
  }

  const statsByProduct = new Map<string, { sum: number; count: number }>()

  for (const review of data as ReviewAggregateRow[]) {
    const prev = statsByProduct.get(review.product_id) || { sum: 0, count: 0 }
    statsByProduct.set(review.product_id, {
      sum: prev.sum + Number(review.rating || 0),
      count: prev.count + 1,
    })
  }

  return products.map((product) => {
    const stats = statsByProduct.get(product.id)
    const reviewCount = stats?.count || 0
    const averageRating = reviewCount > 0 ? Number((stats!.sum / reviewCount).toFixed(1)) : 0

    return {
      ...product,
      rating: averageRating,
      review_count: reviewCount,
    }
  })
}