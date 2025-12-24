"use client";

import React from "react";
import Image from "next/image";

const OrderDetails = ({ order }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const isParent = order.isParent;
  const ordersToInclude = isParent ? order.subOrders : [order];

  return (
    <div className="mt-8 space-y-8">
      {ordersToInclude.map((subOrder, index) => (
        <div key={index} className="border-t border-slate-200 pt-8">
          {isParent && (
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              Package from: {subOrder.store.name}
            </h2>
          )}
          <div className="space-y-4">
            {subOrder.items.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="rounded-md object-cover bg-slate-100"
                  />
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {item.couponApplied ? (
                    <>
                      <p className="text-sm text-slate-500 line-through">
                        {currency}
                        {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="font-semibold text-green-600">
                        {currency}
                        {(item.discountedPrice * item.quantity).toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <p className="font-semibold text-slate-800">
                      {currency}
                      {(item.price * item.quantity).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200 text-right">
            <p className="text-slate-600">
              Subtotal: {currency}
              {subOrder.totalPrice.toLocaleString()}
            </p>
            <p className="text-slate-600">
              Delivery: {currency}
              {subOrder.deliveryCharge.toLocaleString()}
            </p>
            {order.totalDiscount > 0 && (
                <p className="text-green-600">
                    Discount: -{currency}
                    {order.totalDiscount.toLocaleString()}
                </p>
            )}
            <p className="text-lg font-bold text-slate-800 mt-2">
              Total: {currency}
              {subOrder.finalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderDetails;