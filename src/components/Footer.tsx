"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-gray-800 mt-auto border-t-4 border-yellow-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-yellow-600 border-2 border-yellow-800 mr-3 flex items-center justify-center">
                <span className="text-yellow-900 text-xs font-bold">📚</span>
              </div>
              <h3 className="text-xl font-bold text-yellow-600">Bookshelf</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Your personal digital library for tracking books, notes, and
              reading progress. Built with Next.js and MongoDB.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-yellow-600 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-yellow-600 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/books"
                  className="text-gray-600 hover:text-yellow-600 transition-colors"
                >
                  My Books
                </Link>
              </li>
              <li>
                <Link
                  href="/notes"
                  className="text-gray-600 hover:text-yellow-600 transition-colors"
                >
                  Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Info */}
          <div>
            <h4 className="text-yellow-600 font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600">
                <span className="text-yellow-600">Version:</span> 1.0.0
              </li>
              <li className="text-gray-600">
                <span className="text-yellow-600">Tech Stack:</span> Next.js,
                MongoDB
              </li>
              <li className="text-gray-600">
                <span className="text-yellow-600">Theme:</span> Minecraft Style
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} Bookshelf. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-gray-500 text-sm">
              Made with ❤️ for book lovers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
