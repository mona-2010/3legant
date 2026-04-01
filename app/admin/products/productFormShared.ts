import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS, ProductCategory } from "@/types"

export type ProductForm = {
  title: string
  slug: string
  description: string
  short_description: string
  measurements: string
  weight: string
  price: number
  original_price: number
  valid_until: string
  image: string
  images: string[]
  color: string[]
  category: ProductCategory[]
  sku: string
  stock: number
  is_active: boolean
}

export type SetProductForm = (fn: (prev: ProductForm) => ProductForm) => void

export const emptyForm: ProductForm = {
  title: "",
  slug: "",
  description: "",
  short_description: "",
  measurements: "",
  weight: "",
  price: 0,
  original_price: 0,
  valid_until: "",
  image: "",
  images: [],
  color: [],
  category: [],
  sku: "",
  stock: 0,
  is_active: true,
}

export const generateSKU = (title: string, currentSku: string = ""): string => {
  if (!title.trim()) return ""
  
  const words = title.trim().split(/\s+/)
  const prefix = words.length >= 2 
    ? words.map(w => w[0]).join("").toUpperCase().substring(0, 3)
    : words[0].toUpperCase().substring(0, 3)

  const parts = currentSku.split("-")
  const existingSuffix = parts.length > 1 ? parts.slice(1).join("-") : ""
  
  if (existingSuffix && existingSuffix.length >= 4) {
    return `${prefix}-${existingSuffix}`
  }

  const newSuffix = Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, "0")
  return `${prefix}-${newSuffix}`
}

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

const sanitizeNumber = (value: string) => {
  if (value === "") return ""
  return value.replace(/^0+(?!$)/, "")
}

export const parseDecimalField = (value: string) => {
  const sanitized = sanitizeNumber(value)
  return parseFloat(sanitized) || 0
}

export const parseIntegerField = (value: string) => {
  const sanitized = sanitizeNumber(value)
  return parseInt(sanitized, 10) || 0
}

export const displayNumberInput = (value: number) => (value === 0 ? "" : value)

export { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS }
