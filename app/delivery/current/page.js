"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { MapPinIcon, PhoneIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from "lucide-react";

export default function CurrentOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/delivery/stats");
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.currentOrders);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch("/api/delivery/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Order ${status} successfully!`);
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "out_for_delivery": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed": return <CheckCircleIcon size={14} className="mr-1" />;
      case "out_for_delivery": return <TruckIcon size={14} className="mr-1" />;
      default: return <ClockIcon size={14} className="mr-1" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading current orders...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Current Orders</h1>
        <p className="text-gray-600 mt-1">{orders.length} orders in progress</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <TruckIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No current orders</p>
          <p className="text-gray-400 text-sm">Pick up some orders to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  {order.orderStatus === "confirmed" ? "Confirmed" : "Out for Delivery"}
                </span>
                <p className="text-sm text-gray-500">
                  Picked up {new Date(order.deliveryPickedAt).toLocaleTimeString()}
                </p>
              </div>

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
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Customer Details</h4>
                <div className="space-y-1">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Name:</span> {order.user?.name}
                  </p>
                  <div className="flex items-center text-sm text-blue-800">
                    <PhoneIcon size={14} className="mr-1" />
                    <a href={`tel:${order.user?.phone}`} className="underline">
                      {order.user?.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <MapPinIcon size={16} className="mr-1" />
                  Delivery Address
                </h4>
                <div className="text-sm text-gray-700">
                  <p className="font-medium">{order.deliveryAddress.name}</p>
                  <p>{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.location}</p>
                  <div className="mt-2">
                    <a 
                      href={`tel:${order.deliveryAddress.phone}`}
                      className="inline-flex items-center text-blue-600 underline"
                    >
                      <PhoneIcon size={14} className="mr-1" />
                      {order.deliveryAddress.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Items ({order.items.length})</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
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
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {order.orderStatus === "confirmed" && (
                  <button
                    onClick={() => updateOrderStatus(order._id, "out_for_delivery")}
                    className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <TruckIcon size={16} className="mr-1" />
                    Start Delivery
                  </button>
                )}
                
                <button
                  onClick={() => updateOrderStatus(order._id, "delivered")}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <CheckCircleIcon size={16} className="mr-1" />
                  Delivered
                </button>
                
                <button
                  onClick={() => updateOrderStatus(order._id, "cancelled")}
                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <XCircleIcon size={16} className="mr-1" />
                  Cancel
                </button>
                
                <button
                  onClick={() => updateOrderStatus(order._id, "pending")}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <ClockIcon size={16} className="mr-1" />
                  Back to Pending
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}