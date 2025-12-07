import { NextResponse } from "next/server";
import Address from "@/lib/models/Address";
import dbConnect from "@/lib/dbConnect";

// GET: ব্যবহারকারীর ঠিকানা পুনরুদ্ধার করার জন্য
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  try {
    await dbConnect();
    const address = await Address.findOne({ userId });

    if (!address) {
      return NextResponse.json(null, { status: 404 }); // ঠিকানা পাওয়া যায়নি
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST: নতুন ঠিকানা তৈরি বা আপডেট করার জন্য
export async function POST(request) {
  try {
    const { userId, name, email, street, location, phone } =
      await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log("address updated");

    // Find address by userId and update it, or create a new one if it doesn't exist.
    // This is the Mongoose equivalent of an "upsert".
    const address = await Address.findOneAndUpdate(
      { userId }, // find a document with this filter
      { name, email, street, location, phone, userId }, // document to insert when `upsert: true`
      {
        new: true, // return the new `doc` if one is created
        upsert: true, // make this update into an upsert
        runValidators: true, // ensure schema validation is run
      }
    );

    return NextResponse.json(address, { status: 200 });
  } catch (error) {
    console.error("Error saving address:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to save address" },
      { status: 500 }
    );
  }
}
