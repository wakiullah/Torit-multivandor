import dbConnect from "@/lib/dbConnect";
import Store from "@/lib/models/Store";
import Product from "@/lib/models/Product";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await dbConnect();

  // Remove '@' prefix if it exists
  const username = params.username.startsWith("@")
    ? params.username.slice(1)
    : params.username;

  try {
    const store = await Store.findOne({ username }).lean();

    if (!store) {
      return new Response(JSON.stringify({ message: "Store not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(store));
  } catch (error) {
    return new Response(JSON.stringify({ message: "Server error" }), {
      status: 500,
    });
  }
}
