"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

const DeliveryChargePage = () => {
  const [locations, setLocations] = useState([]);
  const [fromLocation, setFromLocation] = useState("");
  const [toLocation, setToLocation] = useState("");
  const [charge, setCharge] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all locations for dropdowns
  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      const data = await response.json();
      if (data.success) {
        setLocations(data.locations);
      }
    } catch (error) {
      console.error("Failed to fetch locations", error);
    }
  };

  // Fetch existing delivery charges to display
  const fetchDeliveryCharges = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/delivery-charges");
      const data = await response.json();
      if (data.success) {
        setDeliveryCharges(data.charges);
      }
    } catch (error) {
      console.error("Failed to fetch delivery charges", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchLocations(), fetchDeliveryCharges()]);
  }, [fetchDeliveryCharges]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromLocation || !toLocation || !charge) {
      toast.error("Please fill all fields");
      return;
    }
    if (fromLocation === toLocation) {
      toast.error("From and To locations cannot be the same.");
      return;
    }

    const promise = fetch("/api/delivery-charges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromLocation,
        toLocation,
        charge: Number(charge),
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: "Saving charge...",
      success: "Delivery charge saved!",
      error: (err) => err.toString(),
    });
    await promise;
    fetchDeliveryCharges(); // Refresh the list
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) {
      toast.error("Please enter a location name.");
      return;
    }

    const promise = fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newLocation }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      return res.json();
    });

    await toast.promise(promise, {
      loading: "Adding location...",
      success: "Location added successfully!",
      error: (err) => err.toString(),
    });

    setNewLocation("");
    fetchLocations(); // Refresh the location list in dropdowns
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-slate-700">
        Manage Locations & Charges
      </h1>

      {/* Location Add Form */}
      <form
        onSubmit={handleLocationSubmit}
        className="mt-6 flex items-end gap-4 p-4 border border-slate-200 rounded-lg"
      >
        <div className="flex-grow">
          <label className="block text-sm font-medium text-slate-600">
            Add New Location
          </label>
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="mt-1 block w-full p-2 border border-slate-300 rounded-md"
            placeholder="e.g., Rail Gate"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-800 text-white py-2 px-6 rounded-md hover:bg-slate-900"
        >
          Add Location
        </button>
      </form>

      {/* Delivery Charge Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end p-4 border border-slate-200 rounded-lg"
      >
        <div>
          <label className="block text-sm font-medium text-slate-600">
            From
          </label>
          <select
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            className="mt-1 block w-full p-2 border border-slate-300 rounded-md bg-white"
          >
            <option value="">Select a location</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">To</label>
          <select
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            className="mt-1 block w-full p-2 border border-slate-300 rounded-md bg-white"
          >
            <option value="">Select a location</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc._id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">
            Charge (TK)
          </label>
          <input
            type="number"
            value={charge}
            onChange={(e) => setCharge(e.target.value)}
            className="mt-1 block w-full p-2 border border-slate-300 rounded-md"
            placeholder="e.g., 20"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-slate-900"
        >
          Add Charge
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-600">
          Delivery Charges List
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-slate-600">
                  From
                </th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-slate-600">
                  To
                </th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-slate-600">
                  Charge (TK)
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center p-4">
                    Loading...
                  </td>
                </tr>
              ) : deliveryCharges.length > 0 ? (
                deliveryCharges.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="py-2 px-4 border-b text-slate-700">
                      {item.fromLocation?.name}
                    </td>
                    <td className="py-2 px-4 border-b text-slate-700">
                      {item.toLocation?.name}
                    </td>
                    <td className="py-2 px-4 border-b text-slate-700">
                      {item.charge}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-slate-500">
                    No delivery charges found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryChargePage;
