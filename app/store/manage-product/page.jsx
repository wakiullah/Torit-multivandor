"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import Loading from "@/components/Loading";
import { useSelector } from "react-redux";
import EditProductModal from "@/components/store/EditProductModal";

export default function StoreManageProducts() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const storeId = useSelector((state) => state.user.user?.store);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    if (!storeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const id =
        typeof storeId === "object" && storeId !== null ? storeId._id : storeId;
      const response = await fetch(`/api/products?storeId=${id}`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data.items);
      } else {
        toast.error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      toast.error("An error occurred while fetching products");
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setShowEditModal(false);
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Product deleted successfully!");
        fetchProducts(); // Re-fetch products to update the UI
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete product.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting product.");
      console.error("Delete product error:", error);
    }
  };

  const toggleStock = async (productId, currentStockStatus) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inStock: !currentStockStatus }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Product stock updated successfully!");
        fetchProducts(); // Re-fetch products to update the UI
      } else {
        toast.error(data.message || "Failed to update product stock.");
      }
    } catch (error) {
      toast.error("An error occurred while updating product stock.");
      console.error("Toggle stock error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  if (loading) return <Loading />;

  return (
    <>
      <h1 className="text-2xl text-slate-500 mb-5">
        Manage <span className="text-slate-800 font-medium">Products</span>
      </h1>
      <table className="w-full  text-left  ring ring-slate-200  rounded overflow-hidden text-sm">
        <thead className="bg-slate-50 text-gray-700 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3 hidden md:table-cell">Description</th>
            <th className="px-4 py-3 hidden md:table-cell">MRP</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          {products.map((product) => (
            <tr
              key={product._id}
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <div className="flex gap-2 items-center">
                  <Image
                    width={40}
                    height={40}
                    className="p-1 shadow rounded cursor-pointer"
                    src={product.images[0]}
                    alt=""
                  />
                  {product.name}
                </div>
              </td>
              <td className="px-4 py-3 max-w-md text-slate-600 hidden md:table-cell truncate">
                {product.description}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {currency} {product.mrp ? product.mrp.toLocaleString() : "N/A"}
              </td>
              <td className="px-4 py-3">
                {currency}{" "}
                {product.price
                  ? product.price.toLocaleString()
                  : "See variations"}
              </td>
              <td className="px-4 py-3 text-center flex items-center gap-2">
                <button
                  onClick={() => openEditModal(product)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(product._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
                <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={() =>
                      toast.promise(toggleStock(product._id, product.inStock), {
                        loading: "Updating data...",
                      })
                    }
                    checked={product.inStock}
                  />
                  <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200"></div>
                  <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showEditModal && (
        <EditProductModal
          showModal={showEditModal}
          onClose={closeEditModal}
          product={editingProduct}
          onUpdateSuccess={fetchProducts}
        />
      )}
    </>
  );
}
