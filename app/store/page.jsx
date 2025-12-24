"use client";
import Loading from "@/components/Loading";
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  StarIcon,
  TagsIcon,
  CalendarDaysIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReviewList from "@/components/store/ReviewList";
import SalesChart from "@/components/store/SalesChart";
import TopProducts from "@/components/store/TopProducts";

export default function Dashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storeRes, statsRes] = await Promise.all([
          fetch("/api/store"),
          fetch("/api/store/stats"),
        ]);

        if (!storeRes.ok || !statsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const store = await storeRes.json();
        const stats = await statsRes.json();
        
        setStoreData(store);
        setStatsData(stats);

      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dashboardCardsData = [
    {
      title: "Total Earnings",
      value: currency + (statsData?.totalEarnings.toLocaleString() || 0),
      icon: CircleDollarSignIcon,
    },
    {
        title: "Total Orders",
        value: statsData?.totalOrders || 0,
        icon: TagsIcon,
    },
    {
      title: "Total Products",
      value: storeData?.products?.length || 0,
      icon: ShoppingBasketIcon,
    },
    {
      title: "Total Ratings",
      value: storeData?.reviews.length,
      icon: StarIcon,
    },
  ];

  const salesCardsData = [
    {
        title: "Today's Sales",
        value: currency + (statsData?.todaysSales.toLocaleString() || 0),
        icon: CalendarDaysIcon,
    },
    {
        title: "Yesterday's Sales",
        value: currency + (statsData?.yesterdaysSales.toLocaleString() || 0),
        icon: CalendarDaysIcon,
    },
    {
        title: "This Month's Sales",
        value: currency + (statsData?.thisMonthsSales.toLocaleString() || 0),
        icon: CalendarDaysIcon,
    },
    {
        title: "Previous Month's Sales",
        value: currency + (statsData?.prevMonthsSales.toLocaleString() || 0),
        icon: CalendarDaysIcon,
    },
  ]

  if (loading) return <Loading />;
  if (error) return <div>Error: {error}</div>;
  if (!storeData || !statsData) return <div>Store not found or stats unavailable</div>;

  return (
    <div className=" text-slate-500 mb-28">
      <h1 className="text-2xl">
        Seller <span className="text-slate-800 font-medium">Dashboard</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 my-10 mt-4">
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-5 border border-slate-200 p-4 rounded-lg bg-white"
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-500">{card.title}</p>
              <b className="text-2xl font-bold text-slate-800">
                {card.value}
              </b>
            </div>
            <card.icon
              size={48}
              className="w-12 h-12 p-3 text-green-500 bg-green-50 rounded-full"
            />
          </div>
        ))}
        {salesCardsData.map((card, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-5 border border-slate-200 p-4 rounded-lg bg-white"
            >
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-500">{card.title}</p>
                <b className="text-2xl font-bold text-slate-800">
                  {card.value}
                </b>
              </div>
              <card.icon
                size={48}
                className="w-12 h-12 p-3 text-blue-500 bg-blue-50 rounded-full"
              />
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2">
            <SalesChart data={statsData.dailySales} />
        </div>
        <div>
            <TopProducts products={statsData.topProducts} />
        </div>
      </div>

      <div className="mt-8">
        <ReviewList reviews={storeData.reviews} />
      </div>
    </div>
  );
}
