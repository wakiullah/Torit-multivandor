import dbConnect from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  await dbConnect();
  const { id } = params;
  if (!mongoose.isValidObjectId(id))
    return new Response("Invalid id", { status: 400 });
  const doc = await Product.findById(id).lean();
  if (!doc) return new Response("Not found", { status: 404 });
  return Response.json(doc);
}

export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = params;
  if (!mongoose.isValidObjectId(id))
    return new Response("Invalid id", { status: 400 });
  const payload = await req.json();
  // Only validate price against MRP if the product does not have variations
  if (!payload.variations || payload.variations.length === 0) {
    if (
      payload.price != null &&
      payload.mrp != null &&
      Number(payload.price) > Number(payload.mrp)
    ) {
      return new Response(
        JSON.stringify({ message: "Price cannot exceed MRP" }),
        { status: 400 }
      );
    }
  }
  const updated = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) return new Response("Not found", { status: 404 });
  return Response.json(updated);
}

export async function DELETE(_req, { params }) {
  await dbConnect();
  const { id } = params;
  if (!mongoose.isValidObjectId(id))
    return new Response("Invalid id", { status: 400 });
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) return new Response("Not found", { status: 404 });
  return Response.json({ ok: true });
}
