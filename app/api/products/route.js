import dbConnect from "@/lib/dbConnect";
import Product from "@/lib/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");
  const minPrice = Number(searchParams.get("minPrice") || 0);
  const maxPrice = Number(
    searchParams.get("maxPrice") || Number.MAX_SAFE_INTEGER
  );
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);
  const sort = searchParams.get("sort") || "-createdAt";

  const filter = {
    price: { $gte: minPrice, $lte: maxPrice },
    ...(category ? { category } : {}),
    ...(q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return Response.json({ items, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const {
    name,
    description,
    mrp,
    price,
    images,
    category,
    inStock,
    stockQty,
    storeId,
    tags,
  } = body;

  if (
    !name ||
    !description ||
    mrp == null ||
    price == null ||
    !category ||
    !Array.isArray(images) ||
    images.length === 0
  ) {
    return new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }
  if (price > mrp) {
    return new Response(
      JSON.stringify({ message: "Price cannot exceed MRP" }),
      { status: 400 }
    );
  }

  const created = await Product.create({
    name: name.trim(),
    description,
    mrp: Number(mrp),
    price: Number(price),
    images,
    category,
    inStock: !!inStock,
    stockQty: Number(stockQty || 0),
    storeId,
    tags: Array.isArray(tags) ? tags : [],
  });

  return new Response(JSON.stringify(created), { status: 201 });
}
