import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import DeliveryMan from "@/lib/models/DeliveryMan";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    const deliveryMan = await DeliveryMan.findOne({ email });
    if (!deliveryMan || !deliveryMan.isActive) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, deliveryMan.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: deliveryMan._id, role: "delivery" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      deliveryMan: {
        id: deliveryMan._id,
        name: deliveryMan.name,
        email: deliveryMan.email,
        phone: deliveryMan.phone,
        vehicleType: deliveryMan.vehicleType,
      },
    });

    response.cookies.set("delivery_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Delivery login error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}