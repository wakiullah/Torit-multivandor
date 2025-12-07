"use client";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { clearUser } from "@/lib/features/user/userSlice";
import { rehydrateCart } from "@/lib/features/cart/cartSlice";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);

  // Rehydrate cart on initial client-side load
  useEffect(() => {
    dispatch(rehydrateCart());
  }, [dispatch]);

  const cartCount = Object.values(cartItems).reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/shop?search=${search}`);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      toast.success("Logged out successfully");
      dispatch(clearUser());
      router.push("/auth/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="relative bg-white">
      <div className="mx-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">
          <Link
            href="/"
            className="relative text-3xl sm:text-4xl font-semibold text-slate-700"
          >
            <span className="text-green-600 ">go</span>cart
            <span className="text-green-600 text-5xl leading-0">.</span>
            <p className="absolute text-xs font-semibold -top-1 -right-8 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-green-500">
              plus
            </p>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/">About</Link>
            <Link href="/">Contact</Link>

            <form
              onSubmit={handleSearch}
              className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full"
            >
              <Search size={18} className="text-slate-600" />
              <input
                className="w-full bg-transparent outline-none placeholder-slate-600"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                required
              />
            </form>

            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-slate-600"
            >
              <ShoppingCart size={18} />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 left-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="flex items-center gap-2">
                  <User size={18} />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-8 py-2 bg-red-500 hover:bg-red-600 transition text-white rounded-full"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/auth/login">
                <button className="px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-full">
                  Login
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="sm:hidden flex items-center gap-4">
            <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>
              <Search size={20} className="text-slate-600" />
            </button>
            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-slate-600"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobileSearchOpen && (
          <form
            onSubmit={handleSearch}
            className="sm:hidden flex items-center w-full text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full mb-3"
          >
            <Search size={18} className="text-slate-600" />
            <input
              className="w-full bg-transparent outline-none placeholder-slate-600"
              type="text"
              placeholder="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              required
            />
          </form>
        )}

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 w-full bg-white shadow-md z-20">
            <div className="flex flex-col gap-4 p-6">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>
                Shop
              </Link>
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>
              <hr />
              {user ? (
                <div className="flex flex-col gap-4">
                  <Link href="/profile" className="flex items-center gap-2">
                    <User size={18} />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 bg-red-500 hover:bg-red-600 transition text-white rounded-md"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/auth/login">
                  <button className="w-full px-8 py-2 bg-indigo-500 hover:bg-indigo-600 transition text-white rounded-md">
                    Login
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <hr className="border-gray-300" />
    </nav>
  );
};

export default Navbar;
