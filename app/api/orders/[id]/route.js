import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product"; // Ensure Product model is imported for population
import Store from "@/lib/models/Store"; // Ensure Store model is imported for population
import User from "@/lib/models/user"; // Ensure User model is imported for population
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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


export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("store", "name")
      .populate({
        path: "items.product",
        model: "Product",
        select: "name",
      })
      .populate({
        path: "subOrders",
        populate: [
          { path: "store", model: "Store", select: "name" },
          { path: "items.product", model: "Product", select: "name images" },
        ],
      })
      .lean();

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { message: "Failed to fetch order", error: error.message },
      { status: 500 }
    );
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
      const order = await Order.findById(id);
  
      if (!order) {
        return NextResponse.json(
          { message: "Order not found" },
          { status: 404 }
        );
      }
  
      // Check if the authenticated user's store owns this order
      if (order.store.toString() !== storeId) {
        return NextResponse.json(
          { message: "Forbidden: You do not own this order" },
          { status: 403 }
        );
      }
  
      const body = await req.json();
  
      // Update orderStatus
      if (body.orderStatus) {
        order.orderStatus = body.orderStatus;
      }
  
      await order.save();
      return NextResponse.json({ success: true, order });
    } catch (err) {
      console.error("Update order error:", err);
      return NextResponse.json(
        { message: "Failed to update order", error: err.message },
        { status: 500 }
      );
    }
  }
