import { createSlice } from "@reduxjs/toolkit";

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
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    rehydrateCart: (state) => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          state.cartItems = JSON.parse(savedCart);
        }
      } catch (e) {
        console.warn("Could not rehydrate cart state", e);
      }
    },
    addToCart: (state, action) => {
      const { product, selectedVariation, quantity } = action.payload;

      // Determine the unique ID for the cart item.
      // If a variation exists, combine product and variation IDs.
      // Otherwise, just use the product ID.
      const itemId = selectedVariation
        ? `${product._id}_${selectedVariation._id}`
        : product._id;

      if (state.cartItems[itemId]) {
        // If item already exists, just increase quantity
        state.cartItems[itemId].quantity += quantity;
      } else {
        // If item is new, add it to the cart
        const newItem = {
          productId: product._id,
          storeId: product.store?._id,
          name: product.name,
          image: product.images?.[0] || "/placeholder.png",
          quantity: quantity,
          // Use variation properties if they exist, otherwise use base product properties
          price: selectedVariation ? selectedVariation.price : product.price,
          mrp: selectedVariation ? selectedVariation.mrp : product.mrp,
          variation: selectedVariation
            ? {
                _id: selectedVariation._id,
                attributes: selectedVariation.attributes,
              }
            : null,
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
      }
    },
    decrementQuantity: (state, action) => {
      const itemId = action.payload;
      if (state.cartItems[itemId]) {
        if (state.cartItems[itemId].quantity > 1) {
          state.cartItems[itemId].quantity -= 1;
        } else {
          // If quantity is 1, remove the item
          delete state.cartItems[itemId];
        }
        saveCart(state.cartItems);
      }
    },
    clearCart: (state) => {
      state.cartItems = {};
      saveCart(state.cartItems);
    },
  },
});

export const {
  addToCart,
  rehydrateCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// Helper selectors
export const selectCartItems = (state) => Object.values(state.cart.cartItems);

export const selectCartTotal = (state) => {
  return Object.values(state.cart.cartItems).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
};

export const selectTotalCartItems = (state) => {
  return Object.values(state.cart.cartItems).reduce(
    (total, item) => total + item.quantity,
    0
  );
};
