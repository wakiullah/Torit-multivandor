"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  HomeIcon, 
  PackageIcon, 
  TruckIcon, 
  ClockIcon, 
  LogOutIcon,
  MenuIcon,
  XIcon 
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function DeliveryLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deliveryMan, setDeliveryMan] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const sidebarLinks = [
    { name: "Dashboard", href: "/delivery", icon: HomeIcon },
    { name: "Available Orders", href: "/delivery/available", icon: PackageIcon },
    { name: "Current Orders", href: "/delivery/current", icon: TruckIcon },
    { name: "History", href: "/delivery/history", icon: ClockIcon },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/delivery/stats");
      if (response.ok) {
        const data = await response.json();
        setDeliveryMan(data.deliveryMan);
      } else {
        router.push("/delivery/login");
      }
    } catch (error) {
      router.push("/delivery/login");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/delivery/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/delivery/login");
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  if (!deliveryMan) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Delivery Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {deliveryMan.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{deliveryMan.name}</p>
              <p className="text-xs text-gray-500">Rating: {deliveryMan.rating}/5</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${
                pathname === link.href
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <link.icon size={20} className="mr-3" />
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 left-2 right-2">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOutIcon size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <MenuIcon size={24} />
          </button>
          <h1 className="text-lg font-semibold">Delivery Dashboard</h1>
          <div className="w-8" />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}