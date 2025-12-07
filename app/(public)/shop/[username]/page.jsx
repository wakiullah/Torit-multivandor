"use client";
import ProductCard from "@/components/ProductCard";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MailIcon, MapPinIcon, StoreIcon } from "lucide-react";
import Loading from "@/components/Loading";
import Image from "next/image";
import { useSelector } from "react-redux";
import useProducts from "@/lib/useProducts";

export default function StoreShop() {
  const { username } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { fetchProducts } = useProducts();
  const allProducts = useSelector((state) => state.product.list);

  useEffect(() => {
    if (username) {
      const fetchStoreData = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/stores/${username}`);
          if (!res.ok) {
            throw new Error("Store not found");
          }
          const data = await res.json();
          setStore(data);
          // Fetch all products to filter from.
          // This assumes useProducts fetches and populates the redux store.
          fetchProducts();
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchStoreData();
    }
  }, [username, fetchProducts]);

  if (loading) return <Loading />;
  if (error) return <div className="text-center my-10">{error}</div>;
  if (!store) return null;

  const storeProducts = allProducts.filter((p) => p.store?._id === store._id);

  return (
    <div className="min-h-[70vh] mx-6">
      {/* Store Info Banner */}
      <div className="max-w-7xl mx-auto bg-slate-50 rounded-xl p-6 md:p-10 mt-6 flex flex-col md:flex-row items-center gap-6 md:gap-10 shadow-xs">
        <Image
          src={store.image || "/placeholder.png"}
          alt={store.name}
          className="size-32 sm:size-38 object-cover border-2 border-slate-100 rounded-md"
          width={200}
          height={200}
        />
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-semibold text-slate-800">
            {store.name}
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-lg">
            {store.description}
          </p>
          <div className="space-y-2 text-sm text-slate-500 mt-4">
            {store.address && (
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                <span>{store.address}</span>
              </div>
            )}
            {store.email && (
              <div className="flex items-center">
                <MailIcon className="w-4 h-4 text-gray-500 mr-2" />
                <span>{store.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className=" max-w-7xl mx-auto mb-40">
        <h1 className="text-2xl mt-12 flex items-center gap-2">
          <StoreIcon size={24} className="text-slate-500" />
          Products from{" "}
          <span className="text-slate-800 font-medium">{store.name}</span>
        </h1>
        <div className="mt-5 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto">
          {storeProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
