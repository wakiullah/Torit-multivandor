"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import Loading from "@/components/Loading";
import useProducts from "@/lib/useProducts";
import { useSelector } from "react-redux";

export default function StoreProfilePage() {
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
          fetchProducts(); // Fetch all products to filter from
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchStoreData();
    }
  }, [username]);

  if (loading) return <Loading />;
  if (error) return <div className="text-center my-10">{error}</div>;
  if (!store) return null;

  const storeProducts = allProducts.filter((p) => p.store?._id === store._id);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <Image
          src={store.image}
          alt={store.name}
          width={128}
          height={128}
          className="rounded-full object-cover size-32 mb-4 border"
        />
        <h1 className="text-4xl font-bold text-slate-800">{store.name}</h1>
        <p className="text-slate-500 mt-2 max-w-2xl">{store.description}</p>
      </div>

      <h2 className="text-2xl font-semibold text-slate-700 mb-8">
        Products from this store
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 gap-y-10 xl:gap-12 mx-auto mb-32">
        {storeProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
