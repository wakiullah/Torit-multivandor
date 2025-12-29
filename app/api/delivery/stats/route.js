import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import DeliveryMan from "@/lib/models/DeliveryMan";

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Current orders
    const currentOrders = await Order.find({
      deliveryMan: decoded.id,
      orderStatus: { $in: ["confirmed", "out_for_delivery"] },
    }).populate("user", "name phone").populate("store", "name address phone");

    // Today's deliveries
    const todayDeliveries = await Order.find({
      deliveryMan: decoded.id,
      orderStatus: "delivered",
      deliveredAt: { $gte: today },
    }).populate("user", "name").populate("store", "name");

    // Yesterday's deliveries
    const yesterdayDeliveries = await Order.find({
      deliveryMan: decoded.id,
      orderStatus: "delivered",
      deliveredAt: { $gte: yesterday, $lt: today },
    }).populate("user", "name").populate("store", "name");

    // Available orders count
    const availableOrders = await Order.find({
      orderStatus: "pending",
      deliveryMan: { $exists: false },
      isParent: false,
    });

    // Stats
    const todayEarnings = todayDeliveries.reduce((sum, order) => sum + (order.deliveryCharge || 50), 0);
    const yesterdayEarnings = yesterdayDeliveries.reduce((sum, order) => sum + (order.deliveryCharge || 50), 0);

    const deliveryMan = await DeliveryMan.findById(decoded.id);

    return NextResponse.json({
      deliveryMan: {
        name: deliveryMan.name,
        completedOrders: deliveryMan.completedOrders,
        rating: deliveryMan.rating,
      },
      currentOrders,
      todayDeliveries,
      yesterdayDeliveries,
      stats: {
        todayCount: todayDeliveries.length,
        yesterdayCount: yesterdayDeliveries.length,
        currentCount: currentOrders.length,
        availableCount: availableOrders.length,
        todayEarnings,
        yesterdayEarnings,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching delivery stats:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}