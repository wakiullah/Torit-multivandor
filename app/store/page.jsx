"use client";
import Loading from "@/components/Loading";
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StarIcon,
  TagsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReviewList from "@/components/store/ReviewList";

export default function Dashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [error, setError] = useState(null);

  const dashboardCardsData = [
    {
      title: "Total Products",
      value: storeData?.products.length,
      icon: ShoppingBasketIcon,
    },
    {
      title: "Total Earnings",
      value: currency + 0,
      icon: CircleDollarSignIcon,
    },
    { title: "Total Orders", value: 0, icon: TagsIcon },
    {
      title: "Total Ratings",
      value: storeData?.reviews.length,
      icon: StarIcon,
    },
  ];
  console.log(storeData);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await fetch("/api/store");
        if (!response.ok) {
          throw new Error("Failed to fetch store data");
        }
        const data = await response.json();
        setStoreData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!storeData) return <div>Store not found</div>;

  return (
    <div className=" text-slate-500 mb-28">
      <h1 className="text-2xl">
        Seller <span className="text-slate-800 font-medium">Dashboard</span>
      </h1>

      <div className="flex flex-wrap gap-5 my-10 mt-4">
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className="flex items-center gap-11 border border-slate-200 p-3 px-6 rounded-lg"
          >
            <div className="flex flex-col gap-3 text-xs">
              <p>{card.title}</p>
              <b className="text-2xl font-medium text-slate-700">
                {card.value}
              </b>
            </div>
            <card.icon
              size={50}
              className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full"
            />
          </div>
        ))}
      </div>

      <ReviewList reviews={storeData.reviews} />
    </div>
  );
}
