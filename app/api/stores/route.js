// This is a comment to force a reload
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Store from "@/lib/models/Store";
import User from "@/lib/models/user";
import { jwtVerify } from "jose";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(req) {
  await dbConnect();

  const tokenCookie = req.cookies.get("token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(tokenCookie, secret);
    const userId = payload.id;

    const formData = await req.formData();
    const name = formData.get("name");
    const username = formData.get("username");
    const description = formData.get("description");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const image = formData.get("image");

    if (
      !name ||
      !username ||
      !description ||
      !email ||
      !contact ||
      !address ||
      !image
    ) {
      return NextResponse.json(
        { message: "Please fill all fields" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({}, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        })
        .end(buffer);
    });
    const imageUrl = response.secure_url;

    const newStore = new Store({
      name,
      username,
      description,
      email,
      contact,
      address,
      image: imageUrl,
      owner: userId,
      status: "pending",
    });

    await newStore.save();

    await User.findByIdAndUpdate(userId, {
      store: newStore._id,
      role: "vendor",
    });

    return NextResponse.json({ success: true, store: newStore });
  } catch (error) {
    if (error.name === "JWTExpired" || error.name === "JWSInvalid") {
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: 401 }
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
