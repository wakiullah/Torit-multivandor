"use client";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useSelector } from "react-redux";

export default function StoreAddProduct() {
  const { user } = useSelector((state) => state.user);

  const categories = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Beauty & Health",
    "Toys & Games",
    "Sports & Outdoors",
    "Books & Media",
    "Food & Drink",
    "Hobbies & Crafts",
    "Others",
  ];

  const [images, setImages] = useState([]);
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    category: "",
    hasVariations: false, // New field to indicate if the product has variations
    mrp: 0, // Now optional, will only be used if hasVariations is false
    price: 0, // Now optional, will only be used if hasVariations is false
  });
  const [variations, setVariations] = useState([
    { attributes: [{ name: "", value: "" }], price: 0, sku: "" },
  ]);
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (e) => {
    setProductInfo({ ...productInfo, [e.target.name]: e.target.value });
  };

  const handleVariationChange = (index, field, value) => {
    const newVariations = [...variations];
    newVariations[index][field] = value;
    setVariations(newVariations);
  };

  const handleAttributeChange = (
    variationIndex,
    attributeIndex,
    field,
    value
  ) => {
    const newVariations = [...variations];
    newVariations[variationIndex].attributes[attributeIndex][field] = value;
    setVariations(newVariations);
  };

  const handleAddAttribute = (variationIndex) => {
    const newVariations = [...variations];
    newVariations[variationIndex].attributes.push({ name: "", value: "" });
    setVariations(newVariations);
  };

  const handleRemoveAttribute = (variationIndex, attributeIndex) => {
    const newVariations = [...variations];
    newVariations[variationIndex].attributes.splice(attributeIndex, 1);
    setVariations(newVariations);
  };

  const addVariation = () => {
    setVariations([
      ...variations,
      { attributes: [{ name: "", value: "" }], price: 0, sku: "" },
    ]);
  };

  const removeVariation = (index) => {
    const newVariations = variations.filter((_, i) => i !== index);
    setVariations(newVariations);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    // if (images.length === 0) {
    //     toast.error("Please upload at least one product image.");
    //     setLoading(false);
    //     return;
    // }

    if (!productInfo.name) {
      toast.error("Product name is required.");
      setLoading(false);
      return;
    }

    if (!productInfo.description) {
      toast.error("Product description is required.");
      setLoading(false);
      return;
    }

    if (!productInfo.category) {
      toast.error("Product category is required.");
      setLoading(false);
      return;
    }

    const imageUrls = images; // Images state already holds the secure URLs from Cloudinary

    const productData = {
      ...productInfo,
      images: imageUrls,
    };

    if (productInfo.hasVariations) {
      productData.variations = variations;
      // Remove top-level price and mrp if variations are used
      delete productData.mrp;
      delete productData.price;
    }
    console.log(productData);

    const response = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (data.success) {
      toast.success("Product added successfully");
      setImages([]);
      setProductInfo({
        name: "",
        description: "",
        category: "",
        hasVariations: false,
        mrp: 0,
        price: 0,
      });
      setVariations([
        { attributes: [{ name: "", value: "" }], price: 0, stock: 0, sku: "" },
      ]);
    } else {
      console.log(data);
      toast.error(data.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={(e) =>
        toast.promise(onSubmitHandler(e), { loading: "Adding Product..." })
      }
      className="text-slate-500 mb-28"
    >
      <h1 className="text-2xl">
        Add New <span className="text-slate-800 font-medium">Products</span>
      </h1>
      <p className="mt-7">Product Images</p>

      <div htmlFor="" className="flex gap-3 mt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <CldUploadWidget
            key={index}
            uploadPreset="edelivery"
            onSuccess={(result) => {
              console.log("Cloudinary Upload Result:", result); // Debugging log
              setImages((prevImages) => [
                ...prevImages,
                result.info.secure_url,
              ]);
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="border border-slate-200 rounded cursor-pointer"
              >
                {images[index] ? (
                  <Image
                    width={100}
                    height={100}
                    className="h-15 w-auto"
                    src={images[index]}
                    alt=""
                  />
                ) : (
                  <Image
                    width={100}
                    height={100}
                    className="h-15 w-auto"
                    src={assets.upload_area}
                    alt=""
                  />
                )}
              </button>
            )}
          </CldUploadWidget>
        ))}
      </div>

      <label htmlFor="" className="flex flex-col gap-2 my-6 ">
        Name
        <input
          type="text"
          name="name"
          onChange={onChangeHandler}
          value={productInfo.name}
          placeholder="Enter product name"
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded"
          required
        />
      </label>

      <label htmlFor="" className="flex flex-col gap-2 my-6 ">
        Description
        <textarea
          name="description"
          onChange={onChangeHandler}
          value={productInfo.description}
          placeholder="Enter product description"
          rows={5}
          className="w-full max-w-sm p-2 px-4 outline-none border border-slate-200 rounded resize-none"
          required
        />
      </label>

      <div className="flex items-center gap-2 my-6">
        <input
          type="checkbox"
          id="hasVariations"
          name="hasVariations"
          checked={productInfo.hasVariations}
          onChange={(e) =>
            setProductInfo({ ...productInfo, hasVariations: e.target.checked })
          }
          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
        />
        <label htmlFor="hasVariations">
          This product has variations (e.g., different sizes, weights)
        </label>
      </div>

      {!productInfo.hasVariations && (
        <div className="flex gap-5">
          <label htmlFor="" className="flex flex-col gap-2 ">
            Actual Price ($)
            <input
              type="number"
              name="mrp"
              onChange={onChangeHandler}
              value={productInfo.mrp}
              placeholder="0"
              rows={5}
              className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none"
              required={!productInfo.hasVariations}
            />
          </label>
          <label htmlFor="" className="flex flex-col gap-2 ">
            Offer Price ($)
            <input
              type="number"
              name="price"
              onChange={onChangeHandler}
              value={productInfo.price}
              placeholder="0"
              rows={5}
              className="w-full max-w-45 p-2 px-4 outline-none border border-slate-200 rounded resize-none"
              required={!productInfo.hasVariations}
            />
          </label>
        </div>
      )}

      {productInfo.hasVariations && (
        <div className="my-6 p-4 border border-slate-200 rounded">
          <h3 className="text-xl font-medium mb-4">Product Variations</h3>
          {variations.map((variation, index) => (
            <div
              key={index}
              className="flex flex-col gap-4 border-b border-slate-100 pb-4 mb-4 last:border-b-0"
            >
              <div className="flex flex-col gap-2">
                <h4 className="font-medium mt-2">Attributes:</h4>
                {variation.attributes.map((attribute, attrIndex) => (
                  <div key={attrIndex} className="flex gap-4 items-end">
                    <label className="flex flex-col gap-2 flex-1">
                      Name
                      <input
                        type="text"
                        value={attribute.name}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            attrIndex,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Attribute Name (e.g., Color)"
                        className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
                        required
                      />
                    </label>
                    <label className="flex flex-col gap-2 flex-1">
                      Value
                      <input
                        type="text"
                        value={attribute.value}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            attrIndex,
                            "value",
                            e.target.value
                          )
                        }
                        placeholder="Attribute Value (e.g., Red)"
                        className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
                        required
                      />
                    </label>
                    {variation.attributes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttribute(index, attrIndex)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Remove Attribute"
                      >
                        <MinusCircle size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddAttribute(index)}
                  className="mt-2 text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start"
                >
                  <PlusCircle size={18} /> Add Attribute
                </button>
              </div>
              <div className="flex gap-4">
                <label className="flex flex-col gap-2 flex-1">
                  Price ($)
                  <input
                    type="number"
                    value={variation.price}
                    onChange={(e) =>
                      handleVariationChange(
                        index,
                        "price",
                        e.target.value === "" ? 0 : parseFloat(e.target.value)
                      )
                    }
                    placeholder="0"
                    className="w-full p-2 px-4 outline-none border border-slate-200 rounded"
                    required
                  />
                </label>
              </div>
              <div className="flex justify-end">
                {variations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariation(index)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <MinusCircle size={18} /> Remove Variation
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addVariation}
            className="mt-4 text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <PlusCircle size={18} /> Add Another Variation
          </button>
        </div>
      )}

      <select
        onChange={(e) =>
          setProductInfo({ ...productInfo, category: e.target.value })
        }
        value={productInfo.category}
        className="w-full max-w-sm p-2 px-4 my-6 outline-none border border-slate-200 rounded"
        required
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <br />

      <button
        disabled={loading}
        className="bg-slate-800 text-white px-6 mt-7 py-2 hover:bg-slate-900 rounded transition"
      >
        Add Product
      </button>
    </form>
  );
}
