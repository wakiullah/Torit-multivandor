'use client'
import StoreInfo from "@/components/admin/StoreInfo"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function AdminStores() {

    const [stores, setStores] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchStores = async () => {
        const response = await fetch('/api/admin/stores');
        const data = await response.json();
        console.log('API Response:', data);
        if (data.success) {
            setStores(data.stores);
            console.log('Stores set:', data.stores);
        }
        setLoading(false);
    }

    const handleStoreStatusChange = async (storeId, status) => {
        const response = await fetch(`/api/admin/stores/${storeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        const data = await response.json();
        if (data.success) {
            toast.success(`Store ${status}`);
            fetchStores();
        } else {
            toast.error(data.message || `Failed to ${status} store`);
        }
    }

    useEffect(() => {
        fetchStores()
    }, [])

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Stores</span></h1>

            {stores.length ? (
                <div className="flex flex-col gap-4 mt-4">
                    {stores.map((store) => (
                        <div key={store._id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex max-md:flex-col gap-4 md:items-end max-w-4xl" >
                            {/* Store Info */}
                            <StoreInfo store={store} />

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2 flex-wrap">
                                {store.status === 'pending' && (
                                    <>
                                        <button onClick={() => toast.promise(handleStoreStatusChange(store._id, 'approved'), { loading: "Approving..." })} className="bg-green-500 text-white px-4 py-2 rounded-md">Approve</button>
                                        <button onClick={() => toast.promise(handleStoreStatusChange(store._id, 'rejected'), { loading: "Rejecting..." })} className="bg-red-500 text-white px-4 py-2 rounded-md">Reject</button>
                                    </>
                                )}
                                {store.status === 'approved' && <p className="text-green-500">Approved</p>}
                                {store.status === 'rejected' && <p className="text-red-500">Rejected</p>}
                            </div>
                        </div>
                    ))}

                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-medium">No stores Available</h1>
                </div>
            )
            }
        </div>
    ) : <Loading />
}