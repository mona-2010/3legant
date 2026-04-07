"use client"

import CompleteOrder from "@/components/layout/CompleteOrder"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store/store"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { finalizeStripeOrder } from "@/lib/actions/orders"
import { setLastOrder, clearCart } from "@/store/cartSlice"
import { toast } from "react-toastify"
import { useRef } from "react"
import { invalidateCartCache } from "@/lib/cart/fetchCart"

export default function CompletePage() {
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const finalizeCalled = useRef(false)

  const [loading, setLoading] = useState(!!sessionId)
  const lastOrder = useSelector((state: RootState) => state.cart.lastOrder)
  const lastOrderItems = useSelector((state: RootState) => state.cart.lastOrderItems)

  useEffect(() => {
    if (!sessionId || lastOrder || finalizeCalled.current) return

    let channel: any = null
    let pollInterval: any = null

    const finalize = async () => {
      finalizeCalled.current = true
      setLoading(true)

      const { data, error } = await finalizeStripeOrder(sessionId)
      
      if (error) {
        toast.error(error)
        setLoading(false)
        return
      }

      const order = data as any
        if (order) {
          
          // Success: Status is already processing/completed
          if (order.status !== "pending") {
            if (order.user_id) {
              invalidateCartCache(order.user_id)
            }
            dispatch(setLastOrder({
              order: order,
              items: order.order_items
            }))
            dispatch(clearCart())
            setLoading(false)
          } else {
          
          const { createClient } = await import("@/lib/supabase/client")
          const supabase = createClient()
          
          // 1. Realtime Subscription
          channel = supabase
            .channel(`order-finalization-${order.id}`)
            .on(
              "postgres_changes",
              { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
              async (payload: any) => {
                const updatedOrder = payload.new as any
                if (updatedOrder.status !== "pending") {
                  const { data: fullOrder } = await finalizeStripeOrder(sessionId)
                  if (fullOrder) {
                    if (fullOrder.user_id) invalidateCartCache(fullOrder.user_id)
                    dispatch(setLastOrder({
                      order: fullOrder,
                      items: (fullOrder as any).order_items
                    }))
                    dispatch(clearCart())
                    setLoading(false)
                  }
                }
              }
            )
            .subscribe()

          // 2. Polling Fallback (every 3 seconds)
          pollInterval = setInterval(async () => {
             const { data: polledOrder } = await finalizeStripeOrder(sessionId)
             if (polledOrder && polledOrder.status !== "pending") {
                clearInterval(pollInterval)
                if (polledOrder.user_id) invalidateCartCache(polledOrder.user_id)
                dispatch(setLastOrder({
                  order: polledOrder,
                  items: polledOrder.order_items
                }))
                dispatch(clearCart())
                setLoading(false)
             }
          }, 3000)
        }
      }
    }

    finalize()

    return () => {
      if (channel) channel.unsubscribe()
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [sessionId, lastOrder, dispatch])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        <p className="mt-4 text-gray-500 font-medium">Finalizing your order...</p>
      </div>
    )
  }

  const total = lastOrder?.total_price ?? 0

  return (
    <CompleteOrder
      total={total}
      order={lastOrder}
      orderItems={lastOrderItems}
    />
  )
}
