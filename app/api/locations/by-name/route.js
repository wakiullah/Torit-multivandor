import dbConnect from "@/lib/dbConnect";
import Location from "@/lib/models/Location";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Location name is required." },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const location = await Location.findOne({ name });

    if (!location) {
      return NextResponse.json(
        { success: false, message: "Location not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, location });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
