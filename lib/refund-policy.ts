export type RefundRule = { days: number; rate: number }

export function getRefundPolicyRateByDays(daysSinceOrder: number, rules: RefundRule[] = []) {
  if (!rules || rules.length === 0) return 0

  const sortedRules = [...rules].sort((a, b) => a.days - b.days)
  const matchingRule = sortedRules.find((rule) => daysSinceOrder <= rule.days)

  if (matchingRule) {
    return matchingRule.rate / 100 
  }

  return 0 
}

export function getRefundPolicyForOrder(orderCreatedAt: string, orderTotal: number, rules: RefundRule[] = []) {
  const createdAt = new Date(orderCreatedAt)
  const diffMs = Date.now() - createdAt.getTime()
  const daysSinceOrder = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
  
  const refundRate = getRefundPolicyRateByDays(daysSinceOrder, rules)
  const maxRefundAmount = Number((Math.max(0, Number(orderTotal || 0)) * refundRate).toFixed(2))

  return { daysSinceOrder, refundRate, maxRefundAmount }
}
