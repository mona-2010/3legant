export type PriceAwareProduct = {
  price: number
  original_price?: number | null
  valid_until?: string | null
}

export const getOfferEndTimestamp = (validUntil?: string | null) => {
  if (!validUntil) return null
  const timestamp = new Date(validUntil).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

export const hasActiveDiscount = (product: PriceAwareProduct, now = Date.now()) => {
  const basePrice = Number(product.price || 0)
  const originalPrice = Number(product.original_price || 0)
  const offerEnd = getOfferEndTimestamp(product.valid_until)
  return originalPrice > basePrice && !!offerEnd && offerEnd > now
}

export const getEffectiveProductPrice = (product: PriceAwareProduct, now = Date.now()) => {
  const basePrice = Number(product.price || 0)
  const originalPrice = Number(product.original_price || 0)

  if (hasActiveDiscount(product, now)) {
    return basePrice
  }

  if (originalPrice > basePrice) {
    return originalPrice
  }

  return basePrice
}
