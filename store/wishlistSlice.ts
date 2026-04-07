import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"
import { createClient } from "@/lib/supabase/client"
import type { RootState } from "./store"

type WishlistState = {
  productIds: string[]
  colorPreferences: Record<string, string | null>
  status: "idle" | "loading" | "succeeded" | "failed"
  error: string | null
  userId: string | null
}

type WishlistRow = {
  product_id: string
}

const initialState: WishlistState = {
  productIds: [],
  colorPreferences: {},
  status: "idle",
  error: null,
  userId: null,
}

export const fetchWishlist = createAsyncThunk<
  { userId: string; productIds: string[] },
  { userId: string; force?: boolean },
  { state: RootState; rejectValue: string }
>(
  "wishlist/fetchWishlist",
  async ({ userId }, { rejectWithValue }) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", userId)

    if (error) return rejectWithValue(error.message)

    return {
      userId,
      productIds: ((data || []) as WishlistRow[]).map((row) => row.product_id).filter(Boolean),
    }
  },
  {
    condition: ({ userId, force }, { getState }) => {
      if (force) return true
      const state = getState().wishlist
      if (state.status === "loading") return false
      if (state.userId === userId && state.status === "succeeded") return false
      return true
    },
  }
)

export const addToWishlist = createAsyncThunk<
  { productId: string; color?: string | null },
  { userId: string; productId: string; color?: string | null },
  { rejectValue: string }
>("wishlist/addToWishlist", async ({ userId, productId }, { rejectWithValue }) => {
  const supabase = createClient()
  const { error } = await supabase.from("wishlist").insert({
    user_id: userId,
    product_id: productId,
  })

  if (error) return rejectWithValue(error.message)
  return { productId }
})

export const removeFromWishlist = createAsyncThunk<
  string,
  { userId: string; productId: string },
  { rejectValue: string }
>("wishlist/removeFromWishlist", async ({ userId, productId }, { rejectWithValue }) => {
  const supabase = createClient()
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId)

  if (error) return rejectWithValue(error.message)
  return productId
})

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistState: (state) => {
      state.productIds = []
      state.colorPreferences = {}
      state.status = "idle"
      state.error = null
      state.userId = null
    },
    setWishlistProductIds: (state, action: PayloadAction<string[]>) => {
      state.productIds = Array.from(new Set(action.payload))
      state.status = "succeeded"
    },
    addWishlistProductId: (state, action: PayloadAction<string>) => {
      if (!state.productIds.includes(action.payload)) {
        state.productIds.push(action.payload)
      }
    },
    removeWishlistProductId: (state, action: PayloadAction<string>) => {
      state.productIds = state.productIds.filter((id) => id !== action.payload)
      delete state.colorPreferences[action.payload]
    },
    setColorPreference: (state, action: PayloadAction<{ productId: string; color: string | null }>) => {
      state.colorPreferences[action.payload.productId] = action.payload.color
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state, action) => {
        state.status = "loading"
        state.error = null
        state.userId = action.meta.arg.userId
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = "succeeded"
        state.error = null
        state.userId = action.payload.userId
        state.productIds = action.payload.productIds
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = "failed"
        state.error = action.payload || "Failed to load wishlist"
      })
      .addCase(addToWishlist.pending, (state, action) => {
        const { productId } = action.meta.arg
        if (!state.productIds.includes(productId)) {
          state.productIds.push(productId)
        }
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        const productId = action.meta.arg.productId
        state.productIds = state.productIds.filter((id) => id !== productId)
      })
      .addCase(removeFromWishlist.pending, (state, action) => {
        const { productId } = action.meta.arg
        state.productIds = state.productIds.filter((id) => id !== productId)
        delete state.colorPreferences[productId]
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        const productId = action.meta.arg.productId
        if (!state.productIds.includes(productId)) {
          state.productIds.push(productId)
        }
      })
  },
})

export const { clearWishlistState, setWishlistProductIds, addWishlistProductId, removeWishlistProductId, setColorPreference } = wishlistSlice.actions

export const selectWishlistProductIds = (state: RootState) => state.wishlist.productIds
export const selectIsWishlisted = (productId: string) => (state: RootState) =>
  state.wishlist.productIds.includes(productId)

export default wishlistSlice.reducer
