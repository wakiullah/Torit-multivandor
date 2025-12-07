"use client";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import {
  addProducts,
  setProducts,
  startLoading,
  resetProducts,
} from "./features/product/productSlice";

const useProducts = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.product);

  const fetchProducts = useCallback(
    async (page = 1, options = {}) => {
      const { append = false, sort = "-createdAt" } = options;
      if (loading) return;
      dispatch(startLoading());
      try {
        const params = new URLSearchParams({ page, limit: 20, sort });
        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        if (response.ok) {
          if (options.append) {
            dispatch(addProducts(data));
          } else {
            dispatch(setProducts(data));
          }
        } else {
          console.error("Failed to fetch products:", data.message);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    },
    [dispatch]
  );

  return { fetchProducts, resetProducts: () => dispatch(resetProducts()) };
};

export default useProducts;
