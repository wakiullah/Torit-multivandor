import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// Helper function to get initial state from localStorage
const getInitialState = () => {
  try {
    // Check if window is defined (for server-side rendering)
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Recalculate total on load for safety
        parsedCart.total = Object.values(parsedCart.cartItems).reduce(
          (acc, item) => acc + item.quantity,
          0
        );
        return parsedCart;
      }
    }
  } catch (e) {
    console.error("Could not load cart from localStorage", e);
  }
  // Default initial state if nothing in localStorage
  return {
    cartItems: {}, // Using an object for easier lookup by a composite key
    total: 0,
  };
};

const initialState = getInitialState();

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, selectedVariation, quantity = 1 } = action.payload;
      const productId = product._id || product.id;
      const variationId = selectedVariation._id;
      // Create a unique ID for the cart item based on product and variation
      const cartItemId = `${productId}_${variationId}`;

      if (state.cartItems[cartItemId]) {
        // If item already exists, just increase quantity
        state.cartItems[cartItemId].quantity += quantity;
      } else {
        // Otherwise, add new item to cart
        state.cartItems[cartItemId] = {
          productId,
          variationId,
          name: product.name,
          price: selectedVariation.price,
          image: product.images?.[0] || "/placeholder.png",
          variationAttributes: selectedVariation.attributes,
          quantity,
        };
      }
      // Update total count
      state.total += quantity;
      toast.success("Added to cart!");
    },

    incrementQuantity: (state, action) => {
      const { cartItemId } = action.payload;
      if (state.cartItems[cartItemId]) {
        state.cartItems[cartItemId].quantity += 1;
        state.total += 1;
      }
    },

    decrementQuantity: (state, action) => {
      const { cartItemId } = action.payload;
      if (state.cartItems[cartItemId]) {
        if (state.cartItems[cartItemId].quantity > 1) {
          state.cartItems[cartItemId].quantity -= 1;
          state.total -= 1;
        } else {
          // If quantity is 1, remove the item
          state.total -= 1;
          delete state.cartItems[cartItemId];
        }
      }
    },

    deleteItemFromCart: (state, action) => {
      const { cartItemId } = action.payload;
      if (state.cartItems[cartItemId]) {
        state.total -= state.cartItems[cartItemId].quantity;
        delete state.cartItems[cartItemId];
        toast.success("Item removed from cart");
      }
    },
  },
});

export const {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  deleteItemFromCart,
} = cartSlice.actions;

export default cartSlice.reducer;
