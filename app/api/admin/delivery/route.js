import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import DeliveryMan from "@/lib/models/DeliveryMan";
import Order from "@/lib/models/Order";
import User from "@/lib/models/user";

export async function GET(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const deliveryMen = await DeliveryMan.find()
      .populate("currentOrders", "orderStatus finalAmount")
      .sort({ createdAt: -1 });

    return NextResponse.json({ deliveryMen }, { status: 200 });
  } catch (error) {
    console.error("Error fetching delivery men:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { name, email, phone, password, vehicleType, licenseNumber } =
      await req.json();

    const existingDeliveryMan = await DeliveryMan.findOne({ email });
    if (existingDeliveryMan) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const deliveryMan = new DeliveryMan({
      name,
      email,
      phone,
      password: hashedPassword,
      vehicleType,
      licenseNumber,
    });

    await deliveryMan.save();

    return NextResponse.json(
      { message: "Delivery man created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating delivery man:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
