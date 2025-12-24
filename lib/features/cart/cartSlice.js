import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Helper function to save cart to localStorage
const saveCart = (cartItems) => {
  try {
    const serializedState = JSON.stringify(cartItems);
    localStorage.setItem("cart", serializedState);
  } catch (e) {
    console.warn("Could not save cart state", e);
  }
};

const initialState = {
  cartItems: {}, // Use an object for efficient lookups
  coupon: null,
  discount: 0,
  status: 'idle',
  error: null
};

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async ({ code, cartItems }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, cartItems }),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    rehydrateCart: (state) => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const cartItems = JSON.parse(savedCart);
          console.log("Cart items from localStorage:", cartItems);
          // Data migration for older carts without cartItemId
          Object.keys(cartItems).forEach((key) => {
            console.log("Migrating cart item with key:", key, cartItems[key]);
            if (!cartItems[key].cartItemId) {
              cartItems[key].cartItemId = key;
              console.log("Added cartItemId:", cartItems[key]);
            }
          });
          state.cartItems = cartItems;
          saveCart(cartItems); // Save the migrated cart
        }
      } catch (e) {
        console.warn("Could not rehydrate cart state", e);
      }
    },
    addToCart: (state, action) => {
      const { product, selectedVariation, quantity } = action.payload;

      const itemId = selectedVariation
        ? `${product._id}_${selectedVariation._id}`
        : product._id;

      if (state.cartItems[itemId]) {
        state.cartItems[itemId].quantity += quantity;
      } else {
        const newItem = {
          cartItemId: itemId,
          productId: product._id,
          product: {
            _id: product._id,
            name: product.name,
            images: product.images,
            store:
              typeof product.store === "object"
                ? product.store?._id
                : product.store,
          },
          name: product.name,
          image: product.images?.[0] || "/placeholder.png",
          quantity: quantity,
          price: selectedVariation ? selectedVariation.price : product.price,
          mrp: selectedVariation ? selectedVariation.mrp : product.mrp,
          variation: selectedVariation
            ? {
                _id: selectedVariation._id,
                attributes: selectedVariation.attributes,
              }
            : null,
          storeId:
            typeof product.store === "object"
              ? product.store?._id
              : product.store,
        };
        state.cartItems[itemId] = newItem;
      }
      saveCart(state.cartItems);
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      delete state.cartItems[itemId];
      saveCart(state.cartItems);
    },
    incrementQuantity: (state, action) => {
      const itemId = action.payload;
      if (state.cartItems[itemId]) {
        state.cartItems[itemId].quantity += 1;
        saveCart(state.cartItems);
      }
    },
    decrementQuantity: (state, action) => {
      const itemId = action.payload;
      if (state.cartItems[itemId]) {
        if (state.cartItems[itemId].quantity > 1) {
          state.cartItems[itemId].quantity -= 1;
        } else {
          delete state.cartItems[itemId];
        }
        saveCart(state.cartItems);
      }
    },
    clearCart: (state) => {
      state.cartItems = {};
      state.coupon = null;
      state.discount = 0;
      saveCart(state.cartItems);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.coupon = action.payload.coupon;
        state.discount = action.payload.discount;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.coupon = null;
        state.discount = 0;
      });
  },
});

export const {
  addToCart,
  rehydrateCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;

// Helper selectors
export const selectCartItems = (state) => Object.values(state.cart.cartItems);

export const selectCartSubTotal = (state) => {
  return Object.values(state.cart.cartItems).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

export const selectCartTotal = (state) => {
  const subtotal = selectCartSubTotal(state);
  const discount = state.cart.discount || 0;
  return subtotal - discount;
};

export const selectTotalCartItems = (state) => {
  return Object.values(state.cart.cartItems).reduce(
    (total, item) => total + item.quantity,
    0
  );
};

export const selectDiscount = (state) => state.cart.discount;
export const selectCoupon = (state) => state.cart.coupon;
