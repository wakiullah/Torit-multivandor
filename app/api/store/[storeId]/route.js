import dbConnect from "@/lib/dbConnect";
import Store from "@/lib/models/Store";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { storeId } = params;

  if (!storeId) {
    return NextResponse.json(
      { success: false, message: "Store ID is required." },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const store = await Store.findById(storeId).select("location"); // শুধু location ফিল্ডটি নিন

    if (!store) {
      return NextResponse.json(
        { success: false, message: "Store not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, store });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
