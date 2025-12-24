import dbConnect from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import User from "@/lib/models/user";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
    const user = await User.findById(decoded.id);

    if (!user) {
      return { error: "User not found", status: 404 };
    }

    if (user.role !== "vendor" || !user.store) {
      return {
        error: "Unauthorized: Only vendors can perform this action",
        status: 403,
      };
    }

    return { storeId: user.store.toString() };
  } catch (error) {
    return { error: "Not authorized", status: 401 };
  }
}

export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = params;
  const { storeId, error, status } = await getStoreIdFromAuth();

  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if the authenticated user's store owns this product
    if (product.store.toString() !== storeId) {
      return NextResponse.json(
        { message: "Forbidden: You do not own this product" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Toggle inStock status
    if (typeof body.inStock === "boolean") {
      product.inStock = body.inStock;
    }

    await product.save();
    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json(
      { message: "Failed to update product", error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = params;
  const { storeId, error, status } = await getStoreIdFromAuth();

  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.store.toString() !== storeId) {
      return NextResponse.json(
        { message: "Forbidden: You do not own this product" },
        { status: 403 }
      );
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json(
      { message: "Failed to delete product", error: err.message },
      { status: 500 }
    );
  }
}
