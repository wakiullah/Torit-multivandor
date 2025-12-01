'use client'
import Link from "next/link"
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";

const StoreNavbar = () => {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
            });
            dispatch(clearUser());
            router.push("/auth/login");
        } catch (error) {
            console.error('Failed to logout', error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="flex items-center justify-between px-4 sm:px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative text-4xl font-semibold text-slate-700">
                <span className="text-green-600">go</span>cart<span className="text-green-600 text-5xl leading-0">.</span>
                <p className="absolute text-xs font-semibold -top-1 -right-11 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
                    Store
                </p>
            </Link>
            <div className="hidden sm:flex items-center gap-3">
                {user ? (
                    <div className="relative">
                        <button className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <p>Hi, {user.name}</p>
                            <ChevronDown size={18} />
                        </button>
                        {isMobileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <p>Hi, Seller</p>
                )}
            </div>
            <div className="sm:hidden">
                <button onClick={toggleMobileMenu}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
            {isMobileMenuOpen && (
                <div className="sm:hidden absolute top-16 right-4 bg-white rounded-md shadow-lg p-4">
                    {user ? (
                        <div className="flex flex-col gap-4">
                            <p>Hi, {user.name}</p>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <p>Hi, Seller</p>
                    )}
                </div>
            )}
        </div>
    )
}

export default StoreNavbar