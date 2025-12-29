import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

export async function GET(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("delivery_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "delivery") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Get orders that are ready for delivery (shipped) and not assigned to any delivery man
    const availableOrders = await Order.find({
      orderStatus: "pending",
      deliveryMan: { $exists: false },
      isParent: false, // Only sub-orders
    })
      .populate("user", "name phone")
      .populate("store", "name address phone")
      .sort({ createdAt: 1 });

    return NextResponse.json({ orders: availableOrders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching available orders:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
