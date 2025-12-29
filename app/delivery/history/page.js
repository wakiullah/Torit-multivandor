"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CheckCircleIcon, ClockIcon, CalendarIcon } from "lucide-react";

export default function DeliveryHistory() {
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [yesterdayDeliveries, setYesterdayDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/delivery/stats");
      const data = await response.json();
      
      if (response.ok) {
        setTodayDeliveries(data.todayDeliveries);
        setYesterdayDeliveries(data.yesterdayDeliveries);
      } else {
        toast.error("Failed to fetch history");
      }
    } catch (error) {
      toast.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading delivery history...</div>
      </div>
    );
  }

  const currentDeliveries = activeTab === 'today' ? todayDeliveries : yesterdayDeliveries;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Delivery History</h1>
        <p className="text-gray-600 mt-1">Your completed deliveries</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'today'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Today ({todayDeliveries.length})
        </button>
        <button
          onClick={() => setActiveTab('yesterday')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'yesterday'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Yesterday ({yesterdayDeliveries.length})
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon size={20} className="text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600">
                {activeTab === 'today' ? 'Today' : 'Yesterday'}
              </p>
              <p className="text-lg font-bold text-green-700">
                {currentDeliveries.length} Delivered
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <CalendarIcon size={20} className="text-blue-600 mr-2" />
            <div>
              <p className="text-sm text-blue-600">Total Earned</p>
              <p className="text-lg font-bold text-blue-700">
                ৳{currentDeliveries.reduce((sum, order) => sum + (order.deliveryCharge || 50), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      {currentDeliveries.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircleIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">
            No deliveries {activeTab === 'today' ? 'today' : 'yesterday'}
          </p>
          <p className="text-gray-400 text-sm">
            Complete some orders to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentDeliveries.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
              {/* Status and Time */}
              <div className="flex items-center justify-between mb-3">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <CheckCircleIcon size={14} className="mr-1" />
                  Delivered
                </span>
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center">
                    <ClockIcon size={14} className="mr-1" />
                    {new Date(order.deliveredAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Order Info */}
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

              {/* Delivery Address */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Delivered to:</p>
                <p className="text-sm text-gray-600">{order.deliveryAddress.name}</p>
                <p className="text-sm text-gray-600">{order.deliveryAddress.street}</p>
              </div>

              {/* Earnings */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-600">Delivery Fee Earned:</span>
                <span className="font-semibold text-green-600">৳{order.deliveryCharge || 50}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}