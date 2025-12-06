'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const StoreSidebar = () => {
    const pathname = usePathname();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);

    const sidebarLinks = [
        { name: 'Dashboard', href: '/store', icon: HomeIcon },
        { name: 'Add Product', href: '/store/add-product', icon: SquarePlusIcon },
        { name: 'Manage Product', href: '/store/manage-product', icon: SquarePenIcon },
        { name: 'Orders', href: '/store/orders', icon: LayoutListIcon },
    ];

    useEffect(() => {
        const fetchStore = async () => {
            try {
                const response = await fetch('/api/stores/my-store');
                const data = await response.json();
                if (response.ok) {
                    setStore(data.store);
                }
            } catch (error) {
                console.error("Failed to fetch store info", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStore();
    }, []);

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                {loading ? (
                    <div className="w-14 h-14 rounded-full bg-slate-200 animate-pulse" />
                ) : store ? (
                    <>
                        <Image className="w-14 h-14 rounded-full shadow-md" src={store.image} alt={store.name} width={80} height={80} />
                        <p className="text-slate-700">{store.name}</p>
                    </>
                ) : (
                    <p className="text-slate-500">No store found</p>
                )}
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}>
                            <link.icon size={18} className="sm:ml-5" />
                            <p className="max-sm:hidden">{link.name}</p>
                            {pathname === link.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default StoreSidebar;