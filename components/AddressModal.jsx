"use client";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const AddressModal = ({ setShowAddressModal, currentUser }) => {
  const [address, setAddress] = useState({
    name: "",
    email: "",
    street: "",
    location: "",
    phone: "",
  });

  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");

  const userId = currentUser?.id;

  // Fetch all locations for the dropdown
  useEffect(() => {
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
    fetchLocations();
  }, []);

  useEffect(() => {
    async function fetchAddress() {
      // This function will run after locations are fetched
      if (locations.length === 0) return;

      if (userId) {
        try {
          const response = await fetch(`/api/address?userId=${userId}`);
          if (response.ok) {
            const data = await response.json();
            if (data) {
              setAddress(data);
              // Pre-select the location in the dropdown if it exists
              const savedLocation = locations.find(
                (loc) => loc.name === data.street
              );
              if (savedLocation) {
                setSelectedLocationId(savedLocation._id);
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch address:", error);
        }
      } else {
        // For guest users, check localStorage
        const savedAddress = localStorage.getItem("guestAddress");
        if (savedAddress) {
          const parsedAddress = JSON.parse(savedAddress);
          setAddress(parsedAddress);
          const savedLocation = locations.find(
            (loc) => loc.name === parsedAddress.street
          );
          if (savedLocation) {
            setSelectedLocationId(savedLocation._id);
          }
        }
      }
    }

    fetchAddress();
  }, [userId, locations]);

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocationId(locationId);
    const selectedLocation = locations.find((loc) => loc._id === locationId);
    // Set the location name to the 'street' field
    setAddress((prev) => ({
      ...prev,
      street: selectedLocation ? selectedLocation.name : "",
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userId) {
      // Logged-in user: save to DB
      try {
        const response = await fetch("/api/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...address, userId }),
        });
        if (!response.ok) throw new Error("Failed to save address.");
        toast.success("Address saved successfully!");
      } catch (error) {
        toast.error(error.message || "Could not save address.");
        console.error("Error saving to DB", error);
      }
    } else {
      // Guest user: save to localStorage
      localStorage.setItem("guestAddress", JSON.stringify(address));
      toast.success("Address saved for your next visit!");
    }

    setShowAddressModal(false);
  };

  return (
    <form
      onSubmit={(e) =>
        toast.promise(handleSubmit(e), { loading: "Saving Address..." })
      }
      className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center"
    >
      <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6">
        <h2 className="text-3xl ">
          Add New <span className="font-semibold">Address</span>
        </h2>
        <input
          name="name"
          onChange={handleAddressChange}
          value={address.name}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="text"
          placeholder="Enter your name"
          required
        />
        <input
          name="email"
          onChange={handleAddressChange}
          value={address.email}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="email"
          placeholder="Email address"
          required
        />
        <select
          name="location"
          onChange={handleLocationChange}
          value={selectedLocationId}
          required
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full bg-white"
        >
          <option value="">Select Your Area</option>
          {locations.map((loc) => (
            <option key={loc._id} value={loc._id}>
              {loc.name}
            </option>
          ))}
        </select>

        <input
          name="location"
          onChange={handleAddressChange}
          value={address.location}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="text"
          placeholder="Apartment, suite, etc. (optional)"
        />

        <input
          name="phone"
          onChange={handleAddressChange}
          value={address.phone}
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full"
          type="text"
          placeholder="Phone"
          required
        />
        <button className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all">
          SAVE ADDRESS
        </button>
      </div>
      <XIcon
        size={30}
        className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 cursor-pointer"
        onClick={() => setShowAddressModal(false)}
      />
    </form>
  );
};

export default AddressModal;
