import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const generateToken = (id, role, storeId = null, storeStatus = null) => {
  return jwt.sign({ id, role, storeId, storeStatus }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export async function POST(req) {
  await dbConnect();

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Please add all fields" },
      { status: 400 }
    );
  }

  const user = await User.findOne({ email })
    .select("+password")
    .populate("store"); // Populate store here

  if (user && (await user.matchPassword(password))) {
    let storeId = null;
    let storeStatus = null;

    if (user.role === "vendor" && user.store) {
      storeId = user.store._id;
      storeStatus = user.store.status;
    }

    const token = generateToken(user._id, user.role, storeId, storeStatus);
    const response = NextResponse.json(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store
          ? { _id: user.store._id, status: user.store.status }
          : null, // Include store info in response
        token,
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } else {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }
}
