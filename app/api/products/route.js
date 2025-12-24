import dbConnect from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import User from "@/lib/models/user"; // Import User model
import jwt from "jsonwebtoken"; // Import jwt
import { cookies } from "next/headers"; // Import cookies

export const dynamic = "force-dynamic";

// Helper function to get storeId from authenticated user
async function getStoreIdFromAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return { error: "Not authorized", status: 401 };
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("store"); // Populate store

    console.log("Authenticated user:", user);
    if (!user) {
      return { error: "User not found", status: 404 };
    }

    if (user.role !== "vendor" || !user.store) {
      return {
        error:
          "Unauthorized: Only vendors with an associated store can add products",
        status: 403,
      };
    }

    if (user.store.status !== "approved") {
      return {
        error:
          "Forbidden: Your store is not yet approved. Please wait for approval.",
        status: 403,
      };
    }

    return { storeId: user.store._id.toString() };
  } catch (error) {
    console.error("Authentication error:", error);
    return { error: "Not authorized", status: 401 };
  }
}

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const storeId = searchParams.get("storeId");
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(
    searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER
  );
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const sort = searchParams.get("sort") || "-createdAt";

  const priceFilter = {};
  if (minPrice > 0) {
    priceFilter.$gte = minPrice;
  }
  if (maxPrice < Number.MAX_SAFE_INTEGER) {
    priceFilter.$lte = maxPrice;
  }

  const filter = {
    ...(storeId ? { store: storeId } : {}),
    ...(category ? { category } : {}),
    ...(q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ],
        }
      : {}),
  };

  if (Object.keys(priceFilter).length > 0) {
    filter.$or = [
      { price: priceFilter }, // For products without variations
      { "variations.price": priceFilter }, // For products with variations
    ];
  }

  let items;
  const total = await Product.countDocuments(filter);

  if (sort === "random") {
    // Shuffle the products using aggregation pipeline
    items = await Product.aggregate([
      { $match: filter },
      // Get 'limit' number of random documents
      { $sample: { size: limit } },
      // Manually populate store data since .populate() is not available in aggregate
      {
        $lookup: {
          from: "stores", // The actual name of the stores collection in MongoDB
          localField: "store",
          foreignField: "_id",
          as: "storeInfo",
        },
      },
      {
        $unwind: {
          path: "$storeInfo",
          preserveNullAndEmptyArrays: true, // Keep products even if they don't have a store
        },
      },
      {
        $addFields: {
          store: "$storeInfo", // Reshape to match the .populate() structure
        },
      },
      { $project: { storeInfo: 0 } }, // Clean up the temporary field
    ]);
  } else {
    // Use standard find with sort and pagination
    items = await Product.find(filter)
      .populate("store", "name image _id username")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }

  return Response.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req) {
  await dbConnect();

  const { storeId, error, status } = await getStoreIdFromAuth();
  if (error) {
    return new Response(JSON.stringify({ message: error }), { status });
  }

  const body = await req.json();
  const {
    name,
    description,
    mrp,
    price,
    images,
    category,
    hasVariations, // New field
    variations, // New field
  } = body;
  // Basic validation

  console.log("Creating product with data:", body);
  if (!name || !description || !category) {
    return new Response(
      JSON.stringify({
        message: "Missing required fields: name, description, category, images",
      }),
      { status: 400 }
    );
  }

  if (hasVariations) {
    if (!Array.isArray(variations) || variations.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Variations are required when hasVariations is true",
        }),
        { status: 400 }
      );
    }
    for (const variation of variations) {
      if (
        !Array.isArray(variation.attributes) ||
        variation.attributes.length === 0 ||
        !variation.price
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Each variation must have attributes and price",
          }),
          { status: 400 }
        );
      }
      for (const attr of variation.attributes) {
        if (!attr.name || !attr.value) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Each variation attribute must have a name and value",
            }),
            { status: 400 }
          );
        }
      }
    }
  } else {
    // If no variations, mrp and price are required
    const numericMrp = Number(mrp);
    const numericPrice = Number(price);

    if (
      numericMrp == null ||
      numericPrice == null ||
      isNaN(numericMrp) ||
      isNaN(numericPrice)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Missing required fields: mrp, price (for products without variations)",
        }),
        { status: 400 }
      );
    }
    if (numericPrice > numericMrp) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Price cannot exceed MRP (for products without variations)",
        }),
        { status: 400 }
      );
    }
  }

  const productData = {
    name: name.trim(),
    description,
    images,
    category,
    store: storeId, // Use 'store' field now
  };

  if (hasVariations) {
    productData.variations = variations;
    // Calculate overall stock and price range from variations if needed for search/display purposes
    // For simplicity, not doing this automatically now, relying on frontend to manage
  } else {
    productData.mrp = Number(mrp);
    productData.price = Number(price);
  }

  try {
    const created = await Product.create(productData);
    return new Response(JSON.stringify({ success: true, product: created }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to create product",
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
