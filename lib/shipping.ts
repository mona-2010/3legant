import { ShippingMethod } from "@/types"

type ShippingRule =
  | { kind: "flat"; amount: number }
  | { kind: "percent"; amount: number }

const SHIPPING_RULES: Record<string, ShippingRule> = {
  free: { kind: "flat", amount: 0 },
  express: { kind: "flat", amount: 15 },
  pickup: { kind: "percent", amount: 21 }
}

function toTitleCase(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function getShippingMethodLabel(method: ShippingMethod): string {
  if (method === "free") return "Free Shipping"
  if (method === "express") return "Express Shipping"
  if (method === "pickup") return "Pickup (21%)"

  return toTitleCase(method)
}

export function calculateShippingCost(method: ShippingMethod, subtotal: number): number {
  const rule = SHIPPING_RULES[method]
  if (!rule) return 0

  if (rule.kind === "flat") return rule.amount
  return subtotal * (rule.amount / 100)
}

export function getShippingOptionPriceLabel(method: ShippingMethod): string {
  const rule = SHIPPING_RULES[method]
  if (!rule) return "$0.00"

  if (rule.kind === "flat") {
    return rule.amount === 0 ? "$0.00" : `+$${rule.amount.toFixed(2)}`
  }

  return `+${rule.amount}%`
}

export function buildShippingOptions(methods: ShippingMethod[]) {
  return methods.map((method, idx) => ({
    id: idx + 1,
    name: getShippingMethodLabel(method),
    method
  }))
}

