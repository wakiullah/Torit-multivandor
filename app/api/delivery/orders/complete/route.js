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

    // Check if order belongs to this delivery man
    const order = await Order.findOne({
      _id: orderId,
      deliveryMan: decoded.id,
      orderStatus: "out_for_delivery",
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Mark order as delivered
    await Order.findByIdAndUpdate(orderId, {
      orderStatus: "delivered",
      deliveredAt: new Date(),
    });

    // Update delivery man stats
    await DeliveryMan.findByIdAndUpdate(decoded.id, {
      $pull: { currentOrders: orderId },
      $inc: { completedOrders: 1 },
    });

    return NextResponse.json({ message: "Order delivered successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error completing order:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}