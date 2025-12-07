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
    const product = products.find(
      (product) => (product.id || product._id) === productId
    );
    setProduct(product);
  };
  console.log("id", product);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    } else {
      findProduct();
    }
    scrollTo(0, 0);
  }, [productId, products]);

  if (!product) return <Loading />;

  return (
    product && (
      <div className="mx-6">
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
