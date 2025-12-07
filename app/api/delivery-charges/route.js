import dbConnect from "@/lib/dbConnect";
import DeliveryCharge from "@/lib/models/DeliveryCharge";
import { NextResponse } from "next/server";

// GET: সমস্ত ডেলিভারি চার্জ নিয়ে আসার জন্য
export async function GET() {
  try {
    await dbConnect();
    const charges = await DeliveryCharge.find({})
      .populate("fromLocation", "name") // fromLocation এর নাম পপুলেট করুন
      .populate("toLocation", "name"); // toLocation এর নাম পপুলেট করুন

    return NextResponse.json({ success: true, charges });
  } catch (error) {
    console.error("Error fetching delivery charges:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: নতুন ডেলিভারি চার্জ তৈরি বা আপডেট করার জন্য
export async function POST(request) {
  try {
    await dbConnect();
    const { fromLocation, toLocation, charge } = await request.json();

    if (!fromLocation || !toLocation || !charge) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    // Upsert: যদি চার্জ আগে থেকেই থাকে তবে আপডেট করবে, না থাকলে নতুন তৈরি করবে।
    const deliveryCharge = await DeliveryCharge.findOneAndUpdate(
      { fromLocation, toLocation },
      { charge },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(
      { success: true, deliveryCharge },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving delivery charge:", error);
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
