"use client";
import { Trash2Icon } from "lucide-react";
import { toast } from "react-hot-toast";

const CouponList = ({ coupons, fetchCoupons }) => {
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/store/coupons/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to delete coupon.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the coupon.");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6 xl:p-8 ">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Your Coupons
          </h3>
          <span className="text-base font-normal text-gray-500">
            This is a list of your created coupons
          </span>
        </div>
      </div>
      <div className="flex flex-col mt-8">
        <div className="overflow-x-auto rounded-lg">
          <div className="align-middle inline-block min-w-full">
            <div className="shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Code
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Discount
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Expires At
                    </th>
                    <th
                      scope="col"
                      className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td className="p-4 whitespace-nowrap text-sm font-normal text-gray-900">
                        {coupon.code}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm font-normal text-gray-500">
                        {coupon.description}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {coupon.discount}%
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm font-normal text-gray-500">
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 whitespace-nowrap text-sm font-normal text-gray-500">
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2Icon size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponList;
