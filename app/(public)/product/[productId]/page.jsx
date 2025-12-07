"use client";
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useProducts from "@/lib/useProducts";
import Loading from "@/components/Loading";

export default function Product() {
  const { productId } = useParams();
  const [product, setProduct] = useState();
  const products = useSelector((state) => state.product.list);
  const { fetchProducts } = useProducts();

  const findProduct = () => {
    // Find product from Redux store using only _id
    const foundProduct = products.find((p) => p._id === productId);
    if (foundProduct) {
      setProduct(foundProduct);
    } else if (products.length > 0) {
      // If not found in store, fetch directly from API
      fetchProductById();
    }
  };

  const fetchProductById = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      } else {
        console.error("Product not found via API");
      }
    } catch (error) {
      console.error("Failed to fetch product by ID", error);
    }
  };

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    } else {
      findProduct();
    }
  }, [productId, products]);

  if (!product) return <Loading />;

  return (
    product && (
      <div className="mx-3">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrums */}
          <div className="  text-gray-600 text-sm mt-8 mb-5">
            Home / Products / {product?.category}
          </div>

          {/* Product Details */}
          <ProductDetails product={product} />

          {/* Description & Reviews */}
          <ProductDescription product={product} />
        </div>
      </div>
    )
  );
}
