"use client";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

export default function StoreOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/store");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    toast.promise(
      fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: status }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update status");
        fetchOrders(); // Re-fetch orders to show the update
        return res.json();
      }),
      {
        loading: "Updating status...",
        success: "Status updated successfully!",
        error: "Could not update status.",
      }
    );
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <Loading />;

  return (
    <>
      <h1 className="text-2xl text-slate-500 mb-5">
        Store <span className="text-slate-800 font-medium">Orders</span>
      </h1>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="overflow-x-auto rounded-md">
          <table className="w-full text-left ring ring-slate-200 rounded overflow-hidden text-sm">
            <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
              <tr>
                {[
                  "Sr. No.",
                  "Customer",
                  "Total",
                  "Payment",
                  "Discount",
                  "Status",
                  "Date",
                ].map((heading, i) => (
                  <th key={i} className="px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {orders.map((order, index) => (
                <tr
                  key={order._id}
                  className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => openModal(order)}
                >
                  <td className="pl-6 text-green-600">{index + 1}</td>
                  <td className="px-4 py-3">{order.user?.name || order.deliveryAddress?.name}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {currency}
                    {order.finalAmount}
                  </td>
                  <td className="px-4 py-3">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    {order.totalDiscount > 0 ? (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        {currency}
                        {order.totalDiscount}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                      className={`border-gray-300 rounded-md text-sm focus:ring focus:ring-blue-200 ${
                        order.orderStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.orderStatus === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.orderStatus === "shipped"
                          ? "bg-purple-100 text-purple-800"
                          : order.orderStatus === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedOrder && (
        <div
          onClick={closeModal}
          className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-xs z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
              Order Details
            </h2>

            {/* Customer Details */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Customer Details</h3>
              <p>
                <span className="text-green-700">Name:</span>{" "}
                {selectedOrder.deliveryAddress?.name}
              </p>
              <p>
                <span className="text-green-700">Phone:</span>{" "}
                {selectedOrder.deliveryAddress?.phone}
              </p>
              <p>
                <span className="text-green-700">Address:</span>{" "}
                {selectedOrder.deliveryAddress?.street}
              </p>
            </div>

            {/* Products */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Products</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 border border-slate-100 shadow rounded p-2"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-slate-800">{item.name}</p>
                      <p>Qty: {item.quantity}</p>
                      <p>
                        Price: {currency}
                        {item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment, Status & Date */}
            <div className="mb-4">
              <p>
                <span className="text-green-700">Payment Method:</span>{" "}
                {selectedOrder.paymentMethod}
              </p>
              <p>
                <span className="text-green-700">Payment Status:</span>{" "}
                {selectedOrder.paymentStatus}
              </p>
              <p>
                <span className="text-green-700">Order Status:</span>{" "}
                {selectedOrder.orderStatus}
              </p>
              <p>
                <span className="text-green-700">Order Date:</span>{" "}
                {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
