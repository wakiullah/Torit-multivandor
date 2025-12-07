"use client";
import { assets } from "@/assets/assets";
import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

export default function CreateStore() {
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [locations, setLocations] = useState([]);

  const [storeInfo, setStoreInfo] = useState({
    name: "",
    username: "",
    description: "",
    email: "",
    contact: "",
    address: "",
    location: "",
    image: "",
  });

  const onChangeHandler = (e) => {
    setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value });
  };

  const fetchSellerStatus = async () => {
    const response = await fetch("/api/stores/my-store");
    const data = await response.json();
    if (data.store) {
      setAlreadySubmitted(true);
      setStatus(data.store.status);
      if (data.store.status === "pending") {
        setMessage(
          "Your request to become a seller is pending. Please wait for admin approval."
        );
      } else if (data.store.status === "approved") {
        setMessage("Your request to become a seller has been approved.");
      } else if (data.store.status === "rejected") {
        setMessage(
          "Your request to become a seller has been rejected. Please contact support for more information."
        );
      }
    }
    setLoading(false);
  };

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
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", storeInfo.name);
    formData.append("username", storeInfo.username);
    formData.append("description", storeInfo.description);
    formData.append("email", storeInfo.email);
    formData.append("contact", storeInfo.contact);
    formData.append("address", storeInfo.address);
    formData.append("location", storeInfo.location);
    formData.append("image", storeInfo.image);

    const response = await fetch("/api/store", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.success) {
      toast.success("Store submitted for review!");
      setAlreadySubmitted(true);
      setMessage(
        "Your request to become a seller is pending. Please wait for admin approval."
      );
    } else {
      toast.error(data.message || "Something went wrong!");
    }
  };

  useEffect(() => {
    fetchSellerStatus();
    fetchLocations(); // কম্পোনেন্ট লোড হওয়ার সময় লোকেশন ফেচ করুন
  }, []);

  return !loading ? (
    <>
      {!alreadySubmitted ? (
        <div className="mx-6 min-h-[70vh] my-16">
          <form
            onSubmit={onSubmitHandler}
            className="max-w-7xl mx-auto flex flex-col items-start gap-3 text-slate-500"
          >
            {/* Title */}
            <div>
              <h1 className="text-3xl ">
                Add Your{" "}
                <span className="text-slate-800 font-medium">Store</span>
              </h1>
              <p className="max-w-lg">
                To become a seller on GoCart, submit your store details for
                review. Your store will be activated after admin verification.
              </p>
            </div>

            <label className="mt-10 cursor-pointer">
              Store Logo
              <Image
                src={
                  storeInfo.image
                    ? URL.createObjectURL(storeInfo.image)
                    : assets.upload_area
                }
                className="rounded-lg mt-2 h-16 w-auto"
                alt=""
                width={150}
                height={100}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setStoreInfo({ ...storeInfo, image: e.target.files[0] })
                }
                hidden
              />
            </label>

            <p>Username</p>
            <input
              name="username"
              onChange={onChangeHandler}
              value={storeInfo.username}
              type="text"
              placeholder="Enter your store username"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded"
            />

            <p>Name</p>
            <input
              name="name"
              onChange={onChangeHandler}
              value={storeInfo.name}
              type="text"
              placeholder="Enter your store name"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded"
            />

            <p>Description</p>
            <textarea
              name="description"
              onChange={onChangeHandler}
              value={storeInfo.description}
              rows={5}
              placeholder="Enter your store description"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none"
            />

            <p>Email</p>
            <input
              name="email"
              onChange={onChangeHandler}
              value={storeInfo.email}
              type="email"
              placeholder="Enter your store email"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded"
            />

            <p>Contact Number</p>
            <input
              name="contact"
              onChange={onChangeHandler}
              value={storeInfo.contact}
              type="text"
              placeholder="Enter your store contact number"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded"
            />

            <p>Address</p>
            <textarea
              name="address"
              onChange={onChangeHandler}
              value={storeInfo.address}
              rows={5}
              placeholder="Enter your store address"
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded resize-none"
            />

            <p>Shop Location</p>
            <select
              name="location"
              onChange={onChangeHandler}
              value={storeInfo.location}
              required
              className="border border-slate-300 outline-slate-400 w-full max-w-lg p-2 rounded bg-white"
            >
              <option value="">Select a location</option>
              {locations.map((loc) => (
                <option key={loc._id} value={loc._id}>
                  {loc.name}
                </option>
              ))}
            </select>

            <button className="bg-slate-800 text-white px-12 py-2 rounded mt-10 mb-40 active:scale-95 hover:bg-slate-900 transition ">
              Submit
            </button>
          </form>
        </div>
      ) : (
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <p className="sm:text-2xl lg:text-3xl mx-5 font-semibold text-slate-500 text-center max-w-2xl">
            {message}
          </p>
          {status === "approved" && (
            <p className="mt-5 text-slate-400">
              redirecting to dashboard in{" "}
              <span className="font-semibold">5 seconds</span>
            </p>
          )}
        </div>
      )}
    </>
  ) : (
    <Loading />
  );
}
