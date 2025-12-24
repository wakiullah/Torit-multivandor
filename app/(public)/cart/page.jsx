"use client";
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import {
  rehydrateCart,
  removeFromCart,
  selectCartItems,
  selectCartSubTotal,
  selectTotalCartItems,
  selectDiscount,
} from "@/lib/features/cart/cartSlice";
import { ShoppingBagIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const subTotal = useSelector(selectCartSubTotal);
  const totalItems = useSelector(selectTotalCartItems);
  const discount = useSelector(selectDiscount);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(rehydrateCart());
    setLoading(false);
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">
          Loading Cart...
        </h1>
      </div>
    );
  }

  return cartItems.length > 0 ? (
    <div className="min-h-screen mx-3 text-slate-800">
      <div className="max-w-7xl mx-auto ">
        <PageTitle
          heading="My Cart"
          text={`${totalItems} items in your cart`}
          linkText="Add more"
          path="/shop"
        />

        <div className="flex items-start justify-between gap-5 max-lg:flex-col">
          <div className="w-full max-w-4xl">
            <div className="md:hidden flex flex-col gap-4">
              {cartItems.map((item, index) => {
                console.log("Item in cart page map:", item);
                return (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex gap-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="rounded-md object-cover bg-slate-100"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.variation?.attributes
                            ?.map((attr) => attr.value)
                            .join(", ")}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-semibold text-slate-700">
                            {currency}
                            {item.price}
                          </p>
                          {item.mrp > item.price && (
                            <p className="text-xs text-slate-500 line-through">
                              {currency}
                              {item.mrp}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => dispatch(removeFromCart(item.cartItemId))}
                        className="text-red-500 self-start"
                      >
                        <Trash2Icon size={18} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <Counter cartItemId={item.cartItemId} />
                      <p className="font-semibold text-slate-800">
                        {currency}
                        {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <table className="hidden md:table w-full text-slate-600 table-auto">
              <thead>
                <tr className="max-sm:text-sm">
                  <th className="text-left pb-3">Product</th>
                  <th className="text-center pb-3">Price</th>
                  <th className="text-center pb-3">Quantity</th>
                  <th className="text-center pb-3">Subtotal</th>
                  <th className="text-center pb-3">Remove</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item, index) => {
                  console.log("Item in cart page map (table):", item);
                  return (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={item.image}
                            className="bg-slate-100 rounded-md object-cover"
                            alt={item.name}
                            width={64}
                            height={64}
                          />
                          <div>
                            <p className="font-medium text-slate-800">
                              {item.name}
                            </p>
                            {item.variation?.attributes && (
                              <p className="text-xs text-slate-500">
                                {item.variation.attributes
                                  .map((attr) => attr.value)
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex flex-col items-center">
                          <p className="font-semibold text-slate-700">
                            {currency}
                            {item.price}
                          </p>
                          {item.mrp > item.price && (
                            <p className="text-xs text-slate-500 line-through">
                              {currency}
                              {item.mrp}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-center">
                          <Counter cartItemId={item.cartItemId} />
                        </div>
                      </td>
                      <td className="text-center font-semibold text-slate-800">
                        {currency}
                        {(item.price * item.quantity).toLocaleString()}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() =>
                            dispatch(removeFromCart(item.cartItemId))
                          }
                          className="text-red-500 hover:bg-red-50 p-2.5 rounded-full active:scale-95 transition-all"
                        >
                          <Trash2Icon size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <OrderSummary
            totalPrice={subTotal}
            totalDiscount={discount}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-[80vh] mx-6 flex flex-col items-center justify-center gap-6 text-center">
      <ShoppingBagIcon className="text-slate-300" size={80} strokeWidth={1} />
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-700">
          Your Cart is Empty
        </h1>
        <p className="text-slate-500 mt-2">
          Looks like you haven't added anything to your cart yet.
        </p>
      </div>
      <Link
        href="/shop"
        className="bg-slate-800 text-white px-8 py-3 text-sm font-medium rounded-md hover:bg-slate-900 active:scale-95 transition"
      >
        Start Shopping
      </Link>
    </div>
  );
}
