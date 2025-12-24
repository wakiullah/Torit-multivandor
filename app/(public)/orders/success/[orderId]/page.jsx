"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import OrderDetails from "@/components/OrderDetails";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setOrder(data.order);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [orderId]);

  const generatePDF = () => {
    if (!order) return;

    const doc = new jsPDF();
    const isParent = order.isParent;
    const ordersToInclude = isParent ? order.subOrders : [order];
    const currency = "";

    // --- Platform/Company Details (Logo) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    const goText = "go";
    const cartText = "cart";
    const dotText = ".";
    const goTextWidth = doc.getTextWidth(goText);
    const cartTextWidth = doc.getTextWidth(cartText);
    const logoX = 14;
    const logoY = 25;

    doc.setTextColor(34, 197, 94); // green-600
    doc.text(goText, logoX, logoY);

    doc.setTextColor(48, 63, 81); // slate-700
    doc.text(cartText, logoX + goTextWidth, logoY);

    doc.setFontSize(30);
    doc.setTextColor(34, 197, 94); // green-600
    doc.text(dotText, logoX + goTextWidth + cartTextWidth - 0.5, logoY);

    // --- Company Address and Info ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("GoCart Inc.", 150, 20, { align: "left" });
    doc.setFont("helvetica", "normal");
    doc.text("123 Shopping St, Commerce City, 12345", 150, 25, {
      align: "left",
    });
    doc.text("contact@gocart.com | www.gocart.com", 150, 30, {
      align: "left",
    });

    doc.setLineWidth(0.5);
    doc.line(14, 42, 196, 42); // Horizontal line

    // --- Invoice Title and Order Info ---
    doc.setFontSize(20);
    doc.text("Invoice", 14, 55);

    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 14, 62);
    doc.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      140,
      62
    );

    // --- Billed To Section ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Billed To:", 14, 72);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal"); // Reset font to normal for address details
    doc.text(order.deliveryAddress.name, 14, 78);
    doc.text(
      `${order.deliveryAddress.street}, ${
        order.deliveryAddress.location || ""
      }`,
      14,
      83
    );
    doc.text(order.deliveryAddress.phone, 14, 88);

    let finalY = 100;

    ordersToInclude.forEach((subOrder, index) => {
      doc.setFontSize(12);
      doc.text(`Package from: ${subOrder.store.name}`, 14, finalY);
      finalY += 7;

      const tableColumn = ["Product", "Quantity", "Unit Price", "Total"];
      const tableRows = [];

      subOrder.items.forEach((item) => {
        const itemData = [
          item, // Pass the whole item object
          item.quantity,
          `${currency}${item.price.toFixed(2)}`,
          `${currency}${(item.price * item.quantity).toFixed(2)}`,
        ];
        if (item.couponApplied) {
          itemData[2] = `${currency}${item.discountedPrice.toFixed(2)}`;
          itemData[3] = `${currency}${(
            item.discountedPrice * item.quantity
          ).toFixed(2)}`;
        }
        tableRows.push(itemData);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: finalY,
        theme: "grid",
        styles: {
          cellPadding: 2,
          valign: "middle",
        },
        minCellHeight: 15,
        didDrawCell: (data) => {
          if (data.column.index === 0 && data.cell.section === "body") {
            const item = data.row.raw[0];
            const text = item.name;

            if (item.image) {
              const img = new Image();
              img.src = item.image;
              doc.addImage(
                img,
                "JPEG",
                data.cell.x + 2,
                data.cell.y + 2,
                10,
                10
              );
              const textX = data.cell.x + 14;
              const textY = data.cell.y + 5;
              const textWidth = data.cell.width - 16;
              const textLines = doc.splitTextToSize(text, textWidth);
              doc.text(textLines, textX, textY);
            } else {
              doc.text(text, data.cell.x + 2, data.cell.y + 9);
            }
          }
        },
        rowPageBreak: "auto",
      });

      finalY = doc.lastAutoTable.finalY;
    });

    // Totals
    finalY += 10;
    doc.setFontSize(12);
    doc.text(
      `Subtotal: ${currency}${order.totalPrice.toFixed(2)}`,
      140,
      finalY
    );
    doc.text(
      `Delivery: ${currency}${order.deliveryCharge.toFixed(2)}`,
      140,
      finalY + 7
    );
    if (order.totalDiscount > 0) {
      doc.setTextColor(34, 197, 94);
      doc.text(
        `Discount: -${currency}${order.totalDiscount.toFixed(2)}`,
        140,
        finalY + 14
      );
      doc.setTextColor(0, 0, 0);
    }
    doc.setFontSize(14);
    doc.setFont("bold");
    doc.text(
      `Total: ${currency}${order.finalAmount.toFixed(2)}`,
      140,
      finalY + 21
    );

    doc.save(`order_${order._id}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-12 p-8">
      <div className="bg-white rounded-lg shadow-md text-center p-8">
        <CheckCircle className="text-green-500 mx-auto" size={64} />
        <h1 className="text-3xl font-bold text-slate-800 mt-4">
          Thank you for your order!
        </h1>
        <p className="text-slate-600 mt-2">
          Your order has been placed successfully. You can download the invoice
          below.
        </p>
      </div>

      {order && <OrderDetails order={order} />}

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={generatePDF}
          className="flex items-center justify-center gap-2 bg-slate-700 text-white py-2.5 px-6 rounded hover:bg-slate-900 active:scale-95 transition-all"
        >
          <Download size={18} />
          Download Invoice
        </button>
        <button
          onClick={() => router.push("/orders")}
          className="bg-slate-200 text-slate-800 py-2.5 px-6 rounded hover:bg-slate-300 active:scale-95 transition-all"
        >
          View All Orders
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
