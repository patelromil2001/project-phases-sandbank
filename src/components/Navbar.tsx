"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileHref, setProfileHref] = useState<string>("");

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
  };

  const navItems = [
    { href: "/dashboard", icon: "🏠", label: "Dashboard" },
    { href: "/books", icon: "📚", label: "Books" },
    { href: "/notes", icon: "📝", label: "Notes" },
  ];

  const NavLink = ({
    href,
    icon,
    label,
    onClick,
  }: {
    href: string;
    icon: string;
    label: string;
    onClick?: () => void;
  }) => (
    <Link
      href={href}
      className="flex items-center gap-2 hover:text-yellow-600 transition-colors px-3 py-2 rounded-md hover:bg-yellow-50"
      onClick={onClick}
    >
      <div className="w-6 h-6 bg-yellow-600 border border-yellow-800 flex items-center justify-center">
        <span className="text-yellow-900 text-xs">{icon}</span>
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );

  useEffect(() => {
    const fetchUpdatedUser = async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (res.ok) {
          const data = await res.json();
          const slug = data.profileSlug || data._id;
          setProfileHref(`/profile/${slug}`);
        } else {
          // fallback if API fails
          setProfileHref(`/profile/${user?.profileSlug || user?._id}`);
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        setProfileHref(`/profile/${user?.profileSlug || user?._id}`);
      }
    };

    if (user) {
      fetchUpdatedUser();
    }
  }, [user]);

  if (loading) {
    return (
      <nav className="w-full bg-white border-b-4 border-yellow-600 shadow-lg mb-6 p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </nav>
    );
  }

  if (!user) {
    return (
      <nav className="w-full bg-white border-b-4 border-yellow-600 shadow-lg mb-6 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:text-yellow-600 transition-colors"
          >
            <div className="w-8 h-8 bg-yellow-600 border-2 border-yellow-800 flex items-center justify-center">
              <span className="text-yellow-900 text-sm">📚</span>
            </div>
            <span className="text-xl font-bold text-yellow-600">Bookshelf</span>
          </Link>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-yellow-900 font-semibold rounded-md transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-yellow-600 text-yellow-900 hover:bg-yellow-500 font-semibold rounded-md transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full bg-white border-b-4 border-yellow-600 shadow-lg mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-yellow-600 transition-colors">
            <div className="w-8 h-8 bg-yellow-600 border-2 border-yellow-800 flex items-center justify-center">
              <span className="text-yellow-900 text-sm">📚</span>
            </div>
            <span className="text-xl font-bold text-yellow-600">Bookshelf</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-600 border-2 border-yellow-800 flex items-center justify-center rounded-full">
                <span className="text-yellow-900 text-sm">👤</span>
              </div>
              <span className="text-gray-700 font-medium">{user.name}</span>
            </div>

            <div className="flex gap-2">
              <Link
                href={profileHref}
                className="px-3 py-2 border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-yellow-900 font-semibold rounded-md transition-colors text-sm"
              >
                My Page
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 font-semibold rounded-md transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`block w-5 h-0.5 bg-current transform transition duration-300 ${
                    isMobileMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
                  }`}
                ></span>
                <span
                  className={`block w-5 h-0.5 bg-current transition duration-300 ${
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`block w-5 h-0.5 bg-current transform transition duration-300 ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-yellow-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} onClick={closeMobileMenu} />
              ))}

              <div className="px-3 py-2 border-t border-yellow-200 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-yellow-600 border-2 border-yellow-800 flex items-center justify-center rounded-full">
                    <span className="text-yellow-900 text-sm">👤</span>
                  </div>
                  <span className="text-gray-700 font-medium">{user.name}</span>
                </div>

                <div className="space-y-2">
                  <Link
                    href={profileHref}
                    className="block w-full px-3 py-2 border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-yellow-900 font-semibold rounded-md transition-colors text-sm text-center"
                    onClick={closeMobileMenu}
                  >
                    My Page
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-3 py-2 bg-red-600 text-white hover:bg-red-700 font-semibold rounded-md transition-colors text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
