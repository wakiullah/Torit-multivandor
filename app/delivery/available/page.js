"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { MapPinIcon, PhoneIcon, PackageIcon, ClockIcon } from "lucide-react";

export default function AvailableOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/delivery/orders");
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const pickOrder = async (orderId) => {
    try {
      const response = await fetch("/api/delivery/orders/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Order picked successfully!");
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to pick order");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Available Orders</h1>
        <p className="text-gray-600 mt-1">{orders.length} orders ready for pickup</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <PackageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No orders available</p>
          <p className="text-gray-400 text-sm">Check back later for new deliveries</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="mb-2 sm:mb-0">
                  <h3 className="font-semibold text-lg">Order #{order._id.slice(-6)}</h3>
                  <p className="text-sm text-gray-600">Store: {order.store?.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">৳{order.finalAmount}</p>
                  <p className="text-sm text-gray-500">{order.items.length} items</p>
                </div>
              </div>

              {/* Store Info */}
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-green-900 mb-2">Store Details</h4>
                <div className="space-y-1">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Name:</span> {order.store?.name}
                  </p>
                  {order.store?.address && (
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Address:</span> {order.store.address}
                    </p>
                  )}
                  {order.store?.phone && (
                    <div className="flex items-center text-sm text-green-800">
                      <PhoneIcon size={14} className="mr-1" />
                      <a href={`tel:${order.store.phone}`} className="underline">
                        {order.store.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                <div className="space-y-1">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Name:</span> {order.user?.name}
                  </p>
                  <div className="flex items-center text-sm text-gray-700">
                    <PhoneIcon size={14} className="mr-1" />
                    <a href={`tel:${order.deliveryAddress.phone}`} className="underline">
                      {order.deliveryAddress.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <MapPinIcon size={16} className="mr-1" />
                  Delivery Address
                </h4>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">{order.deliveryAddress.name}</p>
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.location}</p>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">{item.name} x{item.quantity}</span>
                        <span className="text-gray-600">৳{item.price * item.quantity}</span>
                      </div>
                      {item.variation && item.variation.attributes && (
                        <div className="mt-1">
                          {item.variation.attributes.map((attr, attrIndex) => (
                            <span key={attrIndex} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mr-1">
                              {attr.name}: {attr.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-gray-500">+{order.items.length - 3} more items</p>
                  )}
                </div>
              </div>

              {/* Order Time */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <ClockIcon size={14} className="mr-1" />
                Ordered {new Date(order.createdAt).toLocaleString()}
              </div>

              {/* Pick Button */}
              <button
                onClick={() => pickOrder(order._id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <PackageIcon size={18} className="mr-2" />
                Pick This Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}