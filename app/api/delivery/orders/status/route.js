import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import DeliveryMan from "@/lib/models/DeliveryMan";

export async function POST(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get("delivery_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "delivery") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    // Check if order belongs to this delivery man
    const order = await Order.findOne({
      _id: orderId,
      deliveryMan: decoded.id,
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const updateData = { orderStatus: status };

    // Handle specific status updates
    if (status === "delivered") {
      updateData.deliveredAt = new Date();
      // Remove from current orders and increment completed count
      await DeliveryMan.findByIdAndUpdate(decoded.id, {
        $pull: { currentOrders: orderId },
        $inc: { completedOrders: 1 },
      });
    } else if (status === "cancelled" || status === "pending") {
      // Remove from delivery man's current orders
      await DeliveryMan.findByIdAndUpdate(decoded.id, {
        $pull: { currentOrders: orderId },
      });
      // Clear delivery man assignment if cancelled or back to pending
      if (status === "cancelled" || status === "pending") {
        updateData.deliveryMan = null;
        updateData.deliveryPickedAt = null;
      }
    }

    await Order.findByIdAndUpdate(orderId, updateData);

    return NextResponse.json({ message: "Status updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}