"use client";
import { PlusIcon, SquarePenIcon, XIcon } from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import AddressModal from "./AddressModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const OrderSummary = ({ totalPrice, items, totalDiscount }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [user, setUser] = useState(null); // To store logged-in user info
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [storeLocationId, setStoreLocationId] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    async function loadAddress() {
      if (showAddressModal) return;

      // Try to get logged-in user data
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData); // Set user state

          // Fetch address for the logged-in user
          const addressRes = await fetch(`/api/address?userId=${userData.id}`);
          if (addressRes.ok) {
            const addressData = await addressRes.json();
            setDeliveryAddress(addressData);
          }
        } else {
          // Not logged in, load from localStorage
          const savedAddress = localStorage.getItem("guestAddress");
          if (savedAddress) {
            setDeliveryAddress(JSON.parse(savedAddress));
          }
        }
      } catch (error) {
        console.error("Error loading user or address:", error);
        // Fallback for guest
        try {
          const savedAddress = localStorage.getItem("guestAddress");
          if (savedAddress) {
            setDeliveryAddress(JSON.parse(savedAddress));
          }
        } catch (localError) {
          console.error("Error reading from localStorage:", localError);
        }
      }
    }
    loadAddress();
  }, [showAddressModal]);

  const handleCouponCode = async (event) => {
    event.preventDefault();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!deliveryAddress) {
      toast.error("Please add a delivery address first.");
      return;
    }

    // Here you would proceed with the order, including the delivery charge
    router.push("/orders");
  };

  // Calculate delivery charge when address or items change
  const calculateDeliveryCharge = useCallback(async () => {
    if (!deliveryAddress?.street || items.length === 0) {
      setDeliveryCharge(0);
      return;
    }

    let currentStoreLocationId = storeLocationId;

    // 1. Get Store Location ID if not already fetched
    if (!currentStoreLocationId) {
      try {
        const storeId = items[0].storeId;
        if (!storeId) return; // Exit if no storeId on cart item
        const storeRes = await fetch(`/api/store/${storeId}`);
        const storeData = await storeRes.json();
        if (storeData.success) {
          currentStoreLocationId = storeData.store.location;
          setStoreLocationId(currentStoreLocationId); // Cache it in state
        } else {
          return; // Could not get store location
        }
      } catch (error) {
        console.error("Failed to fetch store location", error);
        return;
      }
    }

    // 2. Get Customer Location ID from address street name
    let customerLocId;
    try {
      const customerLocationRes = await fetch(
        `/api/locations/by-name?name=${encodeURIComponent(
          deliveryAddress.street
        )}`
      );
      const customerLocationData = await customerLocationRes.json();
      if (customerLocationData.success) {
        customerLocId = customerLocationData.location?._id;
      }
    } catch (error) {
      console.error("Failed to fetch customer location by name", error);
    }

    // 3. Calculate Charge
    if (currentStoreLocationId && customerLocId) {
      const res = await fetch(
        `/api/delivery-charges/calculate?from=${currentStoreLocationId}&to=${customerLocId}`
      );
      const data = await res.json();
      if (data.success) {
        setDeliveryCharge(data.charge);
      }
    }
  }, [deliveryAddress, items, storeLocationId]);

  useEffect(() => {
    calculateDeliveryCharge();
  }, [calculateDeliveryCharge]);

  return (
    <div className="w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7">
      <h2 className="text-xl font-medium text-slate-600">Payment Summary</h2>
      <p className="text-slate-400 text-xs my-4">Payment Method</p>
      <div className="flex gap-2 items-center">
        <input
          type="radio"
          id="COD"
          onChange={() => setPaymentMethod("COD")}
          checked={paymentMethod === "COD"}
          className="accent-gray-500"
        />
        <label htmlFor="COD" className="cursor-pointer">
          COD
        </label>
      </div>

      <div className="my-4 py-4 border-y border-slate-200 text-slate-400">
        <p>Address</p>
        {deliveryAddress ? (
          <div className="text-slate-600 mt-2">
            <p className="font-medium">{deliveryAddress.name}</p>
            <p className="text-sm">
              {deliveryAddress.street}
              {deliveryAddress.location ? `, ${deliveryAddress.location}` : ""}
            </p>
            <p className="text-sm">{deliveryAddress.phone}</p>
            <SquarePenIcon
              onClick={() => setShowAddressModal(true)}
              className="cursor-pointer mt-2 text-slate-500 hover:text-slate-800"
              size={18}
            />
          </div>
        ) : (
          <div className="mt-2">
            <button
              className="flex items-center gap-1 text-slate-600 mt-1"
              onClick={() => setShowAddressModal(true)}
            >
              Add Address <PlusIcon size={18} />
            </button>
          </div>
        )}
      </div>
      <div className="pb-4 border-b border-slate-200">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1 text-slate-400">
            <p>Subtotal:</p>
            <p>Delivery Charge:</p>
            {totalDiscount > 0 && (
              <p className="text-green-600">Total Savings:</p>
            )}
            {coupon && <p>Coupon:</p>}
          </div>
          <div className="flex flex-col gap-1 font-medium text-right">
            <p>
              {currency}
              {totalPrice.toLocaleString()}
            </p>
            <p>
              {currency}
              {deliveryCharge}
            </p>
            {totalDiscount > 0 && (
              <p className="text-green-600">
                -{currency}
                {totalDiscount.toLocaleString()}
              </p>
            )}
            {coupon && (
              <p>{`-${currency}${((coupon.discount / 100) * totalPrice).toFixed(
                2
              )}`}</p>
            )}
          </div>
        </div>
        {!coupon ? (
          <form
            onSubmit={(e) =>
              toast.promise(handleCouponCode(e), {
                loading: "Checking Coupon...",
              })
            }
            className="flex justify-center gap-3 mt-3"
          >
            <input
              onChange={(e) => setCouponCodeInput(e.target.value)}
              value={couponCodeInput}
              type="text"
              placeholder="Coupon Code"
              className="border border-slate-400 p-1.5 rounded w-full outline-none"
            />
            <button className="bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all">
              Apply
            </button>
          </form>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 text-xs mt-2">
            <p>
              Code:{" "}
              <span className="font-semibold ml-1">
                {coupon.code.toUpperCase()}
              </span>
            </p>
            <p>{coupon.description}</p>
            <XIcon
              size={18}
              onClick={() => setCoupon("")}
              className="hover:text-red-700 transition cursor-pointer"
            />
          </div>
        )}
      </div>
      <div className="flex justify-between py-4">
        <p>Total:</p>
        <p className="font-medium text-right">
          {currency}
          {(
            totalPrice +
            deliveryCharge -
            (coupon ? (coupon.discount / 100) * totalPrice : 0)
          ).toLocaleString()}
        </p>
      </div>
      <button
        onClick={(e) =>
          toast.promise(handlePlaceOrder(e), { loading: "placing Order..." })
        }
        className="w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all"
      >
        Place Order
      </button>

      {showAddressModal && (
        <AddressModal
          setShowAddressModal={setShowAddressModal}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default OrderSummary;
