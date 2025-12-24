"use client";
import { useState, useEffect } from "react";
import Title from "@/components/Title";
import { toast } from "react-hot-toast";
import CouponList from "@/components/store/CouponList";
import CouponModal from "@/components/store/CouponModal";

const CouponsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [hasStore, setHasStore] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/store/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data);
      } else {
        toast.error("Failed to fetch coupons.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching coupons.");
    }
  };

  const checkStore = async () => {
    try {
      const res = await fetch("/api/stores/my-store");
      if (res.ok) {
        setHasStore(true);
      }
    } catch (error) {
      // It's okay if this fails, means the user doesn't have a store
    }
  };

  useEffect(() => {
    checkStore();
    fetchCoupons();
  }, []);

  return (
    <>
      <Title title="Coupons" />
      <div className="p-4">
        {hasStore && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create Coupon
          </button>
        </div>
        )}
        <CouponList coupons={coupons} fetchCoupons={fetchCoupons} />
      </div>
      {showModal && <CouponModal setShowModal={setShowModal} fetchCoupons={fetchCoupons} />}
    </>
  );
};

export default CouponsPage;
