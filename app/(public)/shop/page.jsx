"use client";
import { Suspense, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { MoveLeftIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import useProducts from "@/lib/useProducts";
import InfiniteScroll from "react-infinite-scroll-component";
import Loading from "@/components/Loading";

function ShopContent() {
  // get query params ?search=abc
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const router = useRouter();
  const { fetchProducts, resetProducts } = useProducts();
  const dispatch = useDispatch();

  const {
    list: products,
    page,
    hasMore,
    loading,
  } = useSelector((state) => state.product);

  useEffect(() => {
    // reset products and fetch page 1
    dispatch(resetProducts());
    fetchProducts(1, { append: false, sort: "random" });

    return () => {
      // reset products when component unmounts
      dispatch(resetProducts());
    };
  }, [dispatch]); // dispatch is stable, effect runs once

  const filteredProducts = search
    ? products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const fetchMoreData = () => {
    if (!loading && hasMore) {
      fetchProducts(page + 1, { append: true, sort: "random" });
    }
  };

  return (
    <div className="min-h-[70vh] mx-2">
      <div className=" max-w-7xl mx-auto">
        <h1
          onClick={() => router.push("/shop")}
          className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"
        >
          {" "}
          {search && <MoveLeftIcon size={20} />} All{" "}
          <span className="text-slate-700 font-medium">Products</span>
        </h1>
        <InfiniteScroll
          dataLength={filteredProducts.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<Loading />}
          endMessage={
            <p style={{ textAlign: "center" }} className="my-12">
              <b>Yay! You have seen it all</b>
            </p>
          }
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 gap-y-10 xl:gap-12 mx-auto mb-32"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={<div>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
