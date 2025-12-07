"use client";
import { StarIcon, Trophy, Sparkles, Flame, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const productId = product.id || product._id;

  // calculate the average rating of the product
  const rating =
    product.rating && product.rating.length > 0
      ? Math.round(
          product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
            product.rating.length
        )
      : 0;

  const firstVariation = product.variations?.[0];
  const price = product.price ?? firstVariation?.price;
  const mrp = product.mrp ?? firstVariation?.mrp;

  // --- Random Badge Logic ---
  const possibleBadges = useMemo(
    () => [
      {
        text: "Best Seller",
        bgColor: "bg-amber-100",
        textColor: "text-amber-800",
        icon: <Trophy className="text-amber-600" size={14} />,
      },
      {
        text: "New Arrival",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        icon: <Sparkles className="text-green-600" size={14} />,
      },
      {
        text: "Hot Deal",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: <Flame className="text-red-600" size={14} />,
      },
      {
        text: "Limited",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
        icon: <Clock className="text-orange-600" size={14} />,
      },
    ],
    []
  );

  const badge = useMemo(() => {
    // Show badge on 1 out of 5 products randomly (20% chance)
    if (Math.random() <= 0.2) {
      const randomIndex = Math.floor(Math.random() * possibleBadges.length);
      return possibleBadges[randomIndex];
    }
    return null; // No badge for this product
  }, [productId, possibleBadges]); // Each product gets a random badge that persists on re-renders
  // --------------------

  return (
    <Link href={`/product/${productId}`} className=" group ">
      <div className="relative bg-[#F5F5F5] h-40 w-full sm:w-68 sm:h-68 rounded-lg overflow-hidden">
        {badge && (
          <div
            className={`absolute top-2 left-2 ${badge.bgColor} ${badge.textColor} text-xs font-semibold rounded-full z-10 flex items-center justify-center p-2 sm:px-3 sm:py-1.5 sm:gap-1.5`}
          >
            {badge.icon}
            <span className="hidden sm:inline">{badge.text}</span>
          </div>
        )}
        <Image
          fill
          src={product.images?.[0] || "/placeholder.png"}
          className="object-contain group-hover:scale-115 transition duration-300"
          alt=""
        />
      </div>
      <div className="flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60">
        <div>
          <p>{product.name}</p>
          {product.rating && (
            <div className="flex">
              {Array(5)
                .fill("")
                .map((_, index) => (
                  <StarIcon
                    key={index}
                    size={14}
                    className="text-transparent mt-0.5"
                    fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"}
                  />
                ))}
            </div>
          )}
        </div>
        <p>
          {currency}
          {price}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
