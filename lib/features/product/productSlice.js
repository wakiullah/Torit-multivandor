import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  page: 1,
  pages: 1,
  total: 0,
  loading: false,
  hasMore: true,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    startLoading: (state) => {
      state.loading = true;
    },
    // নতুন প্রোডাক্ট যোগ করার জন্য
    addProducts: (state, action) => {
      const { items, page, pages, total } = action.payload;
      // ডুপ্লিকেট প্রোডাক্ট যোগ করা থেকে বিরত থাকা
      const newItems = items.filter(
        (newItem) =>
          !state.list.some(
            (existingItem) =>
              (existingItem._id || existingItem.id) ===
              (newItem._id || newItem.id)
          )
      );
      state.list.push(...newItems);
      state.page = page;
      state.pages = pages;
      state.total = total;
      state.loading = false;
      state.hasMore = page < pages;
    },
    // নতুন করে ফিল্টার বা সার্চ করলে প্রোডাক্ট লিস্ট রিসেট করার জন্য
    setProducts: (state, action) => {
      const { items, page, pages, total } = action.payload;
      state.list = items;
      state.page = page;
      state.pages = pages;
      state.total = total;
      state.loading = false;
      state.hasMore = page < pages;
    },
    resetProducts: () => initialState,
  },
});

export const { startLoading, addProducts, setProducts, resetProducts } =
  productSlice.actions;

export default productSlice.reducer;
