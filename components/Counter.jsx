"use client";

import {
  incrementQuantity,
  decrementQuantity,
} from "@/lib/features/cart/cartSlice";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ cartItemId }) => {
  const dispatch = useDispatch();
  const item = useSelector((state) => state.cart.cartItems[cartItemId]);
  console.log("cartItemId in Counter:", cartItemId);
  console.log("cart items", item);

  // If item is not in cart, don't render the counter
  if (!item) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 border border-gray-300 rounded-md px-3 py-1.5">
      <button onClick={() => dispatch(decrementQuantity(cartItemId))}>
        <MinusIcon size={16} className="text-slate-600" />
      </button>
      <p className="font-semibold text-slate-800 w-4 text-center">
        {item.quantity}
      </p>
      <button onClick={() => dispatch(incrementQuantity(cartItemId))}>
        <PlusIcon size={16} className="text-slate-600" />
      </button>
    </div>
  );
};

export default Counter;
