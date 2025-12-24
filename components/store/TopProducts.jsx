"use client";
import Image from 'next/image';

const TopProducts = ({ products }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Selling Products</h3>
      <div className="space-y-4">
        {products && products.length > 0 ? (
            products.map((product, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Image
                    src={product.image || '/placeholder.png'}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="rounded-md object-cover w-12 h-12"
                />
                <div>
                  <p className="font-semibold text-slate-700 text-sm truncate max-w-[150px]">{product.name}</p>
                  <p className="text-xs text-slate-500">Sold: {product.quantity}</p>
                </div>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {currency}{product.sales.toLocaleString()}
              </p>
            </div>
            ))
        ) : (
            <p className="text-sm text-slate-500 text-center py-4">No sales data for top products yet.</p>
        )}
      </div>
    </div>
  );
};

export default TopProducts;
