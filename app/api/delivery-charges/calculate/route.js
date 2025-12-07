import dbConnect from "@/lib/dbConnect";
import DeliveryCharge from "@/lib/models/DeliveryCharge";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fromLocation = searchParams.get("from");
  const toLocation = searchParams.get("to");

  if (!fromLocation || !toLocation) {
    return NextResponse.json(
      { success: false, message: "From and To locations are required." },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    // Find charge in either direction (A to B or B to A)
    const deliveryInfo = await DeliveryCharge.findOne({
      $or: [
        { fromLocation: fromLocation, toLocation: toLocation },
        { fromLocation: toLocation, toLocation: fromLocation },
      ],
    });

    if (!deliveryInfo) {
      // If no specific charge is found, you can return a default or zero.
      return NextResponse.json({ success: true, charge: 0 });
    }

    return NextResponse.json({ success: true, charge: deliveryInfo.charge });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
