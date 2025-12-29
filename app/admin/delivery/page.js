"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function AdminDeliveryManagement() {
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: "bike",
    licenseNumber: "",
  });

  useEffect(() => {
    fetchDeliveryMen();
  }, []);

  const fetchDeliveryMen = async () => {
    try {
      const response = await fetch("/api/admin/delivery");
      const data = await response.json();
      
      if (response.ok) {
        setDeliveryMen(data.deliveryMen);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch delivery men");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/admin/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Delivery man added successfully!");
        setShowAddForm(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          vehicleType: "bike",
          licenseNumber: "",
        });
        fetchDeliveryMen();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to add delivery man");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/delivery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        toast.success("Status updated successfully!");
        fetchDeliveryMen();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Delivery Man
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Delivery Man</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                >
                  <option value="bike">Bike</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">License Number</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border rounded"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Add Delivery Man
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Men List */}
      <div className="grid gap-4">
        {deliveryMen.length === 0 ? (
          <p className="text-gray-500">No delivery men found</p>
        ) : (
          deliveryMen.map((deliveryMan) => (
            <div key={deliveryMan._id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{deliveryMan.name}</h3>
                  <p className="text-gray-600">{deliveryMan.email}</p>
                  <p className="text-gray-600">{deliveryMan.phone}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {deliveryMan.vehicleType}
                    </span>
                    <span>License: {deliveryMan.licenseNumber}</span>
                    <span>Rating: {deliveryMan.rating}/5</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="mb-2">
                    <span className={`px-2 py-1 rounded text-sm ${deliveryMan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {deliveryMan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <p>Completed: {deliveryMan.completedOrders}</p>
                    <p>Current: {deliveryMan.currentOrders?.length || 0}</p>
                  </div>
                  
                  <button
                    onClick={() => toggleStatus(deliveryMan._id, deliveryMan.isActive)}
                    className={`px-3 py-1 rounded text-sm ${deliveryMan.isActive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                  >
                    {deliveryMan.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}