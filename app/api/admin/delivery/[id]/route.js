import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import DeliveryMan from "@/lib/models/DeliveryMan";
import User from "@/lib/models/User";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    const cookieStore =await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { isActive } = await req.json();
    const { id } = params;

    await DeliveryMan.findByIdAndUpdate(id, { isActive });

    return NextResponse.json({ message: "Status updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating delivery man status:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}