import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Coupon, Order, OrderItem, ShippingMethod } from "@/types"

export type CartItem = {
  id: string
  product_id?: string
  name: string
  image: string
  price: number
  quantity: number
  color?: string
  stock?: number
}

type AppliedCoupon = {
  coupon: Coupon
  discount: number
}

type CartState = {
  items: CartItem[]
  shippingMethod: ShippingMethod
  appliedCoupon: AppliedCoupon | null
  lastOrder: Order | null
  lastOrderItems: OrderItem[]
}

const initialState: CartState = {
  items: [],
  shippingMethod: "free",
  appliedCoupon: null,
  lastOrder: null,
  lastOrderItems: []
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {

    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload
    },

    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(i => i.id === action.payload.id)

      if (existing) {
        existing.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },

    increaseQty: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload)
      if (item) item.quantity += 1
    },

    decreaseQty: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload)
      if (item && item.quantity > 1) item.quantity -= 1
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.id !== action.payload)
    },

    clearCart: (state) => {
      state.items = []
      state.shippingMethod = "free"
      state.appliedCoupon = null
    },

    setShippingMethod: (
      state,
      action: PayloadAction<ShippingMethod>
    ) => {
      state.shippingMethod = action.payload
    },

    applyCoupon: (state, action: PayloadAction<AppliedCoupon>) => {
      state.appliedCoupon = action.payload
    },

    removeCoupon: (state) => {
      state.appliedCoupon = null
    },

    setLastOrder: (state, action: PayloadAction<{ order: Order; items: OrderItem[] }>) => {
      state.lastOrder = action.payload.order
      state.lastOrderItems = action.payload.items
    },

    clearLastOrder: (state) => {
      state.lastOrder = null
      state.lastOrderItems = []
    }

  }
})

export const {
  setCart,
  addToCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
  setShippingMethod,
  applyCoupon,
  removeCoupon,
  setLastOrder,
  clearLastOrder
} = cartSlice.actions

export default cartSlice.reducer