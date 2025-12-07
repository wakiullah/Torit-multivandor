import dbConnect from "@/lib/dbConnect";
import Store from "@/lib/models/Store";
import User from "@/lib/models/user";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(req) {
  await dbConnect();

  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const store = await Store.findOne({ owner: decoded.id })
      .populate("products")
      .populate({
        path: "reviews",
        populate: {
          path: "user",
          model: "User",
          select: "name",
        },
      });

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(store, { status: 200 });
  } catch (error) {
    console.error("Error in /api/store:", error);
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json(
      {
        message: "Something went wrong",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();

  try {
    // 1. Get user from token
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 2. Parse FormData
    const formData = await req.formData();
    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const location = formData.get("location"); // Correctly get location
    const image = formData.get("image");

    // 3. Validate required fields
    if (
      !name ||
      !username ||
      !description ||
      !email ||
      !contact ||
      !address ||
      !location ||
      !image
    ) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields." },
        { status: 400 }
      );
    }

    // 4. Handle image upload
    const buffer = Buffer.from(await image.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filename = Date.now() + "_" + image.name.replaceAll(" ", "_");
    const imagePath = `/uploads/${filename}`;

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    await writeFile(path.join(uploadDir, filename), buffer);
    // 5. Create new store
    const newStore = await Store.create({
      name,
      username,
      description,
      email,
      contact,
      address,
      location, // Pass location ID to the model
      image: imagePath,
      owner: userId,
    });

    // 6. Update user with store ID
    await User.findByIdAndUpdate(userId, {
      store: newStore._id,
      role: "vendor",
    });

    return NextResponse.json(
      { success: true, store: newStore },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating store:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
