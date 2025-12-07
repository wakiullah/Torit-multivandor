import dbConnect from "@/lib/dbConnect";
import Location from "@/lib/models/Location";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const locations = await Location.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: নতুন লোকেশন তৈরি করার জন্য
export async function POST(request) {
  try {
    await dbConnect();
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Location name is required." },
        { status: 400 }
      );
    }

    // চেক করুন লোকেশনটি আগে থেকেই আছে কিনা
    const existingLocation = await Location.findOne({ name });
    if (existingLocation) {
      return NextResponse.json(
        { success: false, message: "Location already exists." },
        { status: 409 }
      );
    }

    const newLocation = await Location.create({ name });
    return NextResponse.json({ success: true, location: newLocation }, { status: 201 });
  } catch (error) {
    console.error("Error creating location:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
