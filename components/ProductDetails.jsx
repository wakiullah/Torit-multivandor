"use client";

import { addToCart } from "@/lib/features/cart/cartSlice";
import {
  StarIcon,
  TagIcon,
  EarthIcon,
  CreditCardIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";

const ProductDetails = ({ product }) => {
  const productId = product.id || product._id;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const cart = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();

  const router = useRouter();

  const [selectedVariation, setSelectedVariation] = useState(
    product.variations?.[0]
  );

  const [mainImage, setMainImage] = useState(
    product.images?.[0] || "/placeholder.png"
  );

  const addToCartHandler = () => {
    if (selectedVariation) {
      // Pass the whole product and the selected variation to the action
      dispatch(addToCart({ product, selectedVariation, quantity: 1 }));
    }
  };

  const averageRating =
    product.rating && product.rating.length > 0
      ? product.rating.reduce((acc, item) => acc + item.rating, 0) /
        product.rating.length
      : 0;

  const price = selectedVariation?.price;
  const mrp = selectedVariation?.mrp;

  // Generate a unique ID for the cart item to check if it exists
  const cartItemId = selectedVariation
    ? `${productId}_${selectedVariation._id}`
    : null;

  return (
    <div className="flex max-lg:flex-col gap-12">
      <div className="flex max-sm:flex-col-reverse gap-3">
        <div className="flex sm:flex-col gap-3">
          {product.images?.map((image, index) => (
            <div
              key={index}
              onClick={() => setMainImage(image)}
              className="bg-slate-100 flex items-center justify-center size-26 rounded-lg group cursor-pointer"
            >
              <Image
                src={image}
                className="group-hover:scale-103 group-active:scale-95 transition"
                alt=""
                width={400}
                height={400}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center h-100 sm:size-113 bg-slate-100 rounded-lg ">
          <Image src={mainImage} alt={product.name} width={500} height={500} />
        </div>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800">
          {product.name}
        </h1>
        {product.store && (
          <div className="text-sm mt-2">
            <span className="text-slate-500">Sold by: </span>
            <Link
              href={`/store/@${product.store.username}`}
              className="text-slate-700 font-medium hover:underline"
            >
              {product.store.name}
            </Link>
          </div>
        )}
        {product.rating && product.rating.length > 0 && (
          <div className="flex items-center mt-2">
            {Array(5)
              .fill("")
              .map((_, index) => (
                <StarIcon
                  key={index}
                  size={14}
                  className="text-transparent mt-0.5"
                  fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"}
                />
              ))}
            <p className="text-sm ml-3 text-slate-500">
              {product.rating.length} Reviews
            </p>
          </div>
        )}
        {/* Variation Selection */}
        {product.variations && product.variations.length > 1 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-600 mb-2">
              {product.variations[0].attributes[0].name}:
            </h3>
            <div className="flex flex-wrap gap-3">
              {product.variations.map((variation) => (
                <button
                  key={variation._id}
                  onClick={() => setSelectedVariation(variation)}
                  className={`px-4 py-2 border rounded-md text-sm transition ${
                    selectedVariation._id === variation._id
                      ? "border-slate-800 bg-slate-800 text-white"
                      : "border-gray-300 bg-white hover:border-slate-500"
                  }`}
                >
                  {variation.attributes[0].value}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
          {price && (
            <p>
              {" "}
              {currency}
              {price}{" "}
            </p>
          )}
          {mrp && (
            <p className="text-xl text-slate-500 line-through">
              {currency}
              {mrp}
            </p>
          )}
        </div>
        {mrp && price && (
          <div className="flex items-center gap-2 text-slate-500">
            <TagIcon size={14} />
            <p>Save {(((mrp - price) / mrp) * 100).toFixed(0)}% right now</p>
          </div>
        )}
        <div className="flex items-end gap-5 mt-10">
          {cart[cartItemId] && (
            <div className="flex flex-col gap-3">
              <p className="text-lg text-slate-800 font-semibold">Quantity</p>
              <Counter cartItemId={cartItemId} />
            </div>
          )}
          <button
            onClick={() =>
              !cart[cartItemId] ? addToCartHandler() : router.push("/cart")
            }
            className="bg-slate-800 text-white px-10 py-3 text-sm font-medium rounded hover:bg-slate-900 active:scale-95 transition"
          >
            {!cart[cartItemId] ? "Add to Cart" : "View Cart"}
          </button>
        </div>
        <hr className="border-gray-300 my-5" />
        <div className="flex flex-col gap-4 text-slate-500">
          <p className="flex gap-3">
            {" "}
            <EarthIcon className="text-slate-400" /> Free shipping worldwide{" "}
          </p>
          <p className="flex gap-3">
            {" "}
            <CreditCardIcon className="text-slate-400" /> 100% Secured Payment{" "}
          </p>
          <p className="flex gap-3">
            {" "}
            <UserIcon className="text-slate-400" /> Trusted by top brands{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
