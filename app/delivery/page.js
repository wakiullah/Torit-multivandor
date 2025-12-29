"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { PackageIcon, TruckIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

export default function DeliveryDashboard() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [deliveryMan, setDeliveryMan] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch("/api/delivery/orders"),
        fetch("/api/delivery/stats")
      ]);
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setAvailableOrders(ordersData.orders);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setDeliveryMan(statsData.deliveryMan);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
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
        fetchData();
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
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {deliveryMan.name}!
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span className="flex items-center">
            <CheckCircleIcon size={16} className="mr-1 text-green-500" />
            {deliveryMan.completedOrders} Total Deliveries
          </span>
          <span className="flex items-center">
            ⭐ {deliveryMan.rating}/5 Rating
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today's Deliveries</p>
              <p className="text-2xl font-bold">{stats.todayCount || 0}</p>
              <p className="text-blue-100 text-xs">৳{stats.todayEarnings || 0} earned</p>
            </div>
            <PackageIcon size={24} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Yesterday</p>
              <p className="text-2xl font-bold">{stats.yesterdayCount || 0}</p>
              <p className="text-green-100 text-xs">৳{stats.yesterdayEarnings || 0} earned</p>
            </div>
            <ClockIcon size={24} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Current Orders</p>
              <p className="text-2xl font-bold">{stats.currentCount || 0}</p>
              <p className="text-orange-100 text-xs">In progress</p>
            </div>
            <TruckIcon size={24} className="text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Available</p>
              <p className="text-2xl font-bold">{stats.availableCount || 0}</p>
              <p className="text-purple-100 text-xs">Ready to pick</p>
            </div>
            <PackageIcon size={24} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Available Orders Section */}
      {availableOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Available Orders ({availableOrders.length})</h2>
          <div className="space-y-4">
            {availableOrders.slice(0, 3).map((order) => (
              <div key={order._id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-semibold">Order #{order._id.slice(-6)}</h3>
                    <p className="text-sm text-gray-600">Store: {order.store?.name}</p>
                    <p className="text-sm text-gray-600">Customer: {order.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">৳{order.finalAmount}</p>
                    <p className="text-sm text-gray-500">{order.items.length} items</p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    📍 {order.deliveryAddress.street}
                  </p>
                </div>
                <button
                  onClick={() => pickOrder(order._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Pick This Order
                </button>
              </div>
            ))}
            {availableOrders.length > 3 && (
              <div className="text-center">
                <a
                  href="/delivery/available"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all {availableOrders.length} available orders →
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/delivery/available"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <PackageIcon size={20} className="text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">View Available Orders</p>
              <p className="text-sm text-blue-600">Pick new deliveries</p>
            </div>
          </a>
          
          <a
            href="/delivery/current"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <TruckIcon size={20} className="text-orange-600 mr-3" />
            <div>
              <p className="font-medium text-orange-900">Current Deliveries</p>
              <p className="text-sm text-orange-600">Complete ongoing orders</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">Today's Performance</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Deliveries Completed</span>
            <span className="font-semibold text-green-600">{stats.todayCount || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Total Earnings</span>
            <span className="font-semibold text-blue-600">৳{stats.todayEarnings || 0}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Average per Delivery</span>
            <span className="font-semibold text-purple-600">
              ৳{stats.todayCount ? Math.round((stats.todayEarnings || 0) / stats.todayCount) : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}