import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Store from "@/lib/models/Store";
import Order from "@/lib/models/Order";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import User from "@/lib/models/user";

async function getStoreIdFromAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
  
    if (!token) {
      return { error: "Not authorized", status: 401 };
    }
  
    try {
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return { error: "User not found", status: 404 };
      }
  
      if (user.role !== "vendor" || !user.store) {
        return {
          error: "Unauthorized: Only vendors can perform this action",
          status: 403,
        };
      }
  
      return { storeId: user.store.toString() };
    } catch (error) {
      return { error: "Not authorized", status: 401 };
    }
  }

export async function GET(req) {
  await dbConnect();
  
  const { storeId, error, status } = await getStoreIdFromAuth();
  
  if (error) {
    return NextResponse.json({ message: error }, { status });
  }

  try {
    const allOrders = await Order.find({ store: storeId }).populate('items.product');
    const totalOrders = allOrders.length;

    // Filter for delivered orders for sales calculations
    const deliveredOrders = allOrders.filter(o => o.orderStatus === 'delivered');

    const totalEarnings = deliveredOrders.reduce((sum, order) => sum + order.finalAmount, 0);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);


    const todaysSales = deliveredOrders
      .filter(o => new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + o.finalAmount, 0);

    const yesterdaysSales = deliveredOrders
        .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= yesterday && orderDate < today;
        })
        .reduce((sum, o) => sum + o.finalAmount, 0);
    
    const thisMonthsSales = deliveredOrders
        .filter(o => new Date(o.createdAt) >= thisMonthStart)
        .reduce((sum, o) => sum + o.finalAmount, 0);

    const prevMonthsSales = deliveredOrders
        .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate >= prevMonth && orderDate <= prevMonthEnd;
        })
        .reduce((sum, o) => sum + o.finalAmount, 0);

    // --- New Features Data ---

    // 1. Last 7 Days Sales Chart Data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d;
    });

    const dailySales = last7Days.map(day => {
        const dayString = day.toISOString().split('T')[0];
        const salesOnDay = deliveredOrders
            .filter(o => o.createdAt.toISOString().split('T')[0] === dayString)
            .reduce((sum, o) => sum + o.finalAmount, 0);
        return { date: day.toLocaleString('en-US', { weekday: 'short' }), sales: salesOnDay };
    }).reverse();

    // 2. Top Selling Products
    const productSales = deliveredOrders.reduce((acc, order) => {
        order.items.forEach(item => {
            const productId = item.product?._id.toString();
            if (productId) {
                if (!acc[productId]) {
                    acc[productId] = { 
                        name: item.product.name,
                        image: item.product.images[0],
                        quantity: 0, 
                        sales: 0 
                    };
                }
                acc[productId].quantity += item.quantity;
                acc[productId].sales += item.price * item.quantity;
            }
        });
        return acc;
    }, {});

    const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5); // Top 5 products


    return NextResponse.json({
      totalEarnings,
      totalOrders,
      todaysSales,
      yesterdaysSales,
      thisMonthsSales,
      prevMonthsSales,
      dailySales,
      topProducts,
    });

  } catch (err) {
    console.error("Error fetching store stats:", err);
    return NextResponse.json(
      { message: "Internal Server Error", error: err.message },
      { status: 500 }
    );
  }
}
