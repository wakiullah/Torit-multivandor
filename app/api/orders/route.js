import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import User from "@/lib/models/user";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getUserIdFromAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return null; // Guest user
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user ? user._id : null;
  } catch (error) {
    return null; // Invalid token or other error
  }
}

export async function GET(req) {
  await dbConnect();

  try {
    const userId = await getUserIdFromAuth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await Order.find({
      user: userId,
      isParent: { $ne: true }, // Parent orders বাদ দিয়ে শুধু actual orders
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await dbConnect();

  try {
    const userId = await getUserIdFromAuth();
    const body = await req.json();

    const {
      items,
      deliveryAddress,
      paymentMethod,
      totalPrice,
      totalDiscount,
      deliveryCharge,
    } = body;

    if (!items || items.length === 0 || !deliveryAddress) {
      return NextResponse.json(
        { message: "Missing required fields: items and delivery address" },
        { status: 400 }
      );
    }

    // Extract only required address fields
    const addressData = {
      name: deliveryAddress.name,
      phone: deliveryAddress.phone,
      street: deliveryAddress.street,
      location: deliveryAddress.location || deliveryAddress.street,
    };

    // --- Start: Multi-store order handling ---

    // 1. Group items by storeId
    const ordersByStore = items.reduce((acc, item) => {
      const storeId = item.store; // storeId is already a string from the frontend
      if (storeId) {
        if (!acc[storeId]) {
          acc[storeId] = [];
        }
        acc[storeId].push(item);
      }
      return acc;
    }, {});

    // 2. Create an order for each store
    const storeIds = Object.keys(ordersByStore);
    const isMultiStoreOrder = storeIds.length > 1;
    let parentOrder = null;

    // If it's a multi-store order, create a parent order first
    if (isMultiStoreOrder) {
      parentOrder = await Order.create({
        user: userId,
        isParent: true,
        deliveryAddress: addressData,
        paymentMethod,
        totalPrice, // Overall total
        totalDiscount,
        deliveryCharge, // Overall delivery charge
        finalAmount: totalPrice - totalDiscount + deliveryCharge,
      });
    }

    const createdOrders = [];
    for (const storeId in ordersByStore) {
      const storeItems = ordersByStore[storeId];

      // Recalculate totals for this specific store's order
      const storeTotalPrice = storeItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      
      const storeTotalDiscount = storeItems.reduce(
        (sum, item) => sum + (item.couponApplied ? (item.price - item.discountedPrice) * item.quantity : 0),
        0
      );

      // For simplicity, we apply the total delivery charge to the first order
      // and 0 to others. This can be enhanced later.
      const isFirstOrder = createdOrders.length === 0;
      const storeDeliveryCharge = isFirstOrder ? deliveryCharge : 0;
      const storeFinalAmount = storeTotalPrice - storeTotalDiscount + storeDeliveryCharge;

      const orderData = {
        user: userId,
        store: storeId,
        items: storeItems.map((item) => ({
          product: item.productId, // Use productId which holds the ID string
          name: item.name,
          image: item.image,
          quantity: item.quantity,
          price: item.price,
          variation: item.variation,
          discountedPrice: item.discountedPrice,
          couponApplied: item.couponApplied,
        })),
        deliveryAddress: addressData,
        paymentMethod,
        totalPrice: storeTotalPrice,
        totalDiscount: storeTotalDiscount,
        deliveryCharge: storeDeliveryCharge,
        finalAmount: storeFinalAmount,
        parentOrder: parentOrder ? parentOrder._id : null, // Link to parent
      };

      const order = await Order.create(orderData);
      createdOrders.push(order);
    }

    // If a parent order was created, update it with sub-order IDs
    if (parentOrder) {
      parentOrder.subOrders = createdOrders.map((o) => o._id);
      await parentOrder.save();
    }

    if (createdOrders.length === 0) {
      return NextResponse.json(
        {
          message: "Could not create any orders. Check item store information.",
        },
        { status: 400 }
      );
    }

    // --- End: Multi-store order handling ---

    return NextResponse.json(
      {
        success: true,
        message: `${createdOrders.length} order(s) created successfully.`,
        orders: createdOrders,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { message: "Failed to create order", error: error.message },
      { status: 500 }
    );
  }
}
