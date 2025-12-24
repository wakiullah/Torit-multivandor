"use client";
import { StarIcon, Trophy, Sparkles, Flame, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const productId = product.id || product._id;

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

  const possibleBadges = useMemo(
    () => [
      {
        text: "Best Seller",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        icon: <Trophy className="text-yellow-600" size={14} />,
      },
      {
        text: "New Arrival",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: <Sparkles className="text-blue-600" size={14} />,
      },
      {
        text: "Hot Deal",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: <Flame className="text-red-600" size={14} />,
      },
      {
        text: "Limited",
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-800",
        icon: <Clock className="text-indigo-600" size={14} />,
      },
    ],
    []
  );

  const badge = useMemo(() => {
    if (Math.random() <= 0.2) {
      const randomIndex = Math.floor(Math.random() * possibleBadges.length);
      return possibleBadges[randomIndex];
    }
    return null;
  }, [productId, possibleBadges]);

  return (
    <div className="group">
      <Link
        href={`/product/${productId}`}
        className={`block ${
          !product.inStock ? "pointer-events-none opacity-70" : ""
        }`}
      >
        <div className="relative bg-gray-50 border border-gray-200 rounded-xl overflow-hidden aspect-square">
          {badge && (
            <div
              className={`absolute top-3 left-3 ${badge.bgColor} ${badge.textColor} text-xs font-bold rounded-full z-10 flex items-center gap-1.5 px-3 py-1.5`}
            >
              {badge.icon}
              <span>{badge.text}</span>
            </div>
          )}
          <Image
            fill
            src={product.images?.[0] || "/placeholder.png"}
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            alt={product.name}
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-base border-2 border-white rounded-full px-4 py-2">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="px-1 py-3">
          <h3 className="text-base font-semibold text-gray-800 truncate" title={product.name}>
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-lg font-bold text-gray-900">
              {currency}{price}
              {mrp && mrp > price && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                {currency}{mrp}
              </span>
            )}
            </p>
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <StarIcon size={16} className="text-yellow-400" fill="#FFC107" />
                <span className="text-sm font-semibold text-gray-600">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
