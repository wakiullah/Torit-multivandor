import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import DeliveryMan from "@/lib/models/DeliveryMan";

export async function POST(req) {
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

    const { orderId } = await req.json();

    // Check if order exists and is available
    const order = await Order.findOne({
      _id: orderId,
      orderStatus: "pending",
      deliveryMan: { $exists: false },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not available" }, { status: 404 });
    }

    // Assign delivery man to order
    await Order.findByIdAndUpdate(orderId, {
      deliveryMan: decoded.id,
      orderStatus: "confirmed",
      deliveryPickedAt: new Date(),
    });

    // Add order to delivery man's current orders
    await DeliveryMan.findByIdAndUpdate(decoded.id, {
      $push: { currentOrders: orderId },
    });

    return NextResponse.json({ message: "Order picked successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error picking order:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}