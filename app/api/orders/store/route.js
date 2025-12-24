import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Store from "@/lib/models/Store";
import Order from "@/lib/models/Order";

export async function GET(req) {
  try {
    await dbConnect();

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const store = await Store.findOne({ owner: decoded.id });
    if (!store) {
      return NextResponse.json(
        { message: "Store not found for the current user." },
        { status: 404 }
      );
    }

    const orders = await Order.find({ store: store._id })
      .populate("user", "name email")
      .sort({
      createdAt: -1,
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    console.error("Error fetching store orders:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
