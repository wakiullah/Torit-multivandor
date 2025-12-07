"use client";
import React, { useMemo, useEffect } from "react";
import Title from "./Title";
import ProductCard from "./ProductCard";
import { useSelector } from "react-redux";
import useProducts from "@/lib/useProducts";

const LatestProducts = () => {
  const displayQuantity = 4;
  const { list: products } = useSelector((state) => state.product);
  const { fetchProducts } = useProducts();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // useMemo to shuffle products only when the products list changes
  const randomProducts = useMemo(() => {
    // Create a shuffled copy and slice it
    return [...products]
      .sort(() => 0.5 - Math.random())
      .slice(0, displayQuantity);
  }, [products]);

  return (
    <div className="px-2 my-12 max-w-6xl mx-auto">
      <Title
        title="Latest Products"
        description={`Showing ${randomProducts.length} of ${products.length} products`}
        href="/shop"
      />
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 gap-y-10 xl:gap-12 mx-auto mb-32">
        {randomProducts.map((product, index) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default LatestProducts;
