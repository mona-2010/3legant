export type CartItem = {
  id: string
  name: string
  color?: string
  price: number
  quantity: number
  image: string
  product_id?: string
  stock?: number
}

export const PRODUCT_CATEGORIES = [
  "living_room",
  "bedroom",
  "kitchen",
  "bathroom",
  "dining",
  "outdoor",
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]

const productCategorySet = new Set<string>(PRODUCT_CATEGORIES)

export const isProductCategory = (value: string): value is ProductCategory => {
  return productCategorySet.has(value)
}

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  living_room: "Living Room",
  bedroom: "Bedroom",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  dining: "Dining",
  outdoor: "Outdoor",
}

export type Product = {
  id: string
  title: string
  slug: string
  description?: string
  short_description?: string
  measurements?: string | null
  weight?: string | null
  price: number
  original_price?: number
  valid_until?: string | null
  image: string
  images?: string[]
  color_mask_svg?: string
  color?: string[]
  category?: ProductCategory[]
  stock: number
  sku?: string
  rating: number
  review_count: number
  is_new?: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type BlogSection = {
  heading: string
  paragraph: string
}

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  cover_image_path: string
  gallery_image_paths: string[]
  sections: BlogSection[]
  author: string
  published_at: string
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
export type PaymentStatus = "pending" | "succeeded" | "completed" | "failed" | "cancelled" | "refunded"
export type ShippingMethod = "free" | "express" | "pickup" | (string & {})

export type OrderRefundRequest = {
  reason: string
  previous_order_status: OrderStatus
  requested_at: string
  reviewed_at?: string | null
  refunded_at?: string | null
  admin_note?: string | null
  admin_decision?: "approved" | "rejected" | null
  stripe_refund_id?: string | null
  refund_amount?: number | null
  refund_rate?: number | null
  days_since_order?: number | null
  is_partial_refund?: boolean | null
}

export type AddressSnapshot = {
  first_name: string
  last_name: string
  phone?: string
  street_address: string
  city: string
  state?: string
  zip_code?: string
  country: string
}

export type OrderUserInfo = {
  first_name: string
  last_name: string
  email: string
  phone?: string
  shipping: AddressSnapshot
  billing?: AddressSnapshot
  refund_request?: OrderRefundRequest
}

export type Order = {
  id: string
  user_id: string
  order_number?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  street_address?: string
  country?: string
  town_city?: string
  state?: string
  zip_code?: string
  billing_address?: string
  user_info?: OrderUserInfo
  shipping_address_id?: string | null
  billing_address_id?: string | null
  payment_method: string
  shipping_method: ShippingMethod
  subtotal: number
  shipping_cost: number
  tax: number
  discount: number
  total_price: number
  status: OrderStatus
  payment_intent_id?: string
  tracking_number?: string
  created_at: string
  updated_at?: string
  delivered_at?: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_title?: string
  product_price?: number
  product_image?: string
  product_color?: string
  quantity: number
  created_at: string
}

export type UserAddress = {
  id: string
  user_id: string
  type: string
  first_name: string
  last_name: string
  phone: string
  street_address: string
  city: string
  state?: string
  zip_code: string
  country: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  order_id: string
  user_id: string
  amount: number
  currency: string
  status: PaymentStatus
  payment_method: string
  transaction_id?: string
  stripe_payment_intent_id?: string
  created_at: string
  updated_at: string
  processed_at?: string
}

export type Coupon = {
  id: string
  code: string
  description?: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  max_discount_amount?: number | null
  min_purchase_amount?: number | null
  max_uses?: number | null
  current_uses: number
  valid_from: string
  valid_until?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AdminUser = {
  id: string
  role: "user" | "admin"
  created_at: string
  updated_at: string
}

export type Review = {
  id: string
  product_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  rating: number
  text: string
  created_at: string
  likes_count: number
  liked_by_me: boolean
  replies: ReviewReply[]
}

export type ReviewReply = {
  id: string
  review_id: string
  user_id: string
  user_name: string
  user_avatar?: string
  text: string
  created_at: string
}

export type ContactMessage = {
  id: string
  full_name: string
  email: string
  message: string
  created_at: string
}
