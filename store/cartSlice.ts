import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type CartItem = {
  id: string
  name: string
  image: string
  price: number
  quantity: number
  color?: string
}

type CartState = {
  items: CartItem[]
  shippingMethod: "free" | "express" | "pickup"
}

const initialState: CartState = {
  items: [],
  shippingMethod: "free"
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
    },

    setShippingMethod: (
      state,
      action: PayloadAction<"free" | "express" | "pickup">
    ) => {
      state.shippingMethod = action.payload
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
  setShippingMethod
} = cartSlice.actions

export default cartSlice.reducer