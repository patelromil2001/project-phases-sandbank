import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 py-20 px-8">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-yellow-800 border-8 border-yellow-900 flex items-center justify-center shadow-2xl">
              <span className="text-yellow-100 text-6xl">📚</span>
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-6 drop-shadow-lg">
            Welcome to Bookshelf
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Your personal digital library for tracking books, notes, and reading progress. 
            Built with modern web technologies and styled with Minecraft inspiration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-yellow-900 text-yellow-100 border-4 border-yellow-800 hover:bg-yellow-800 font-bold text-lg rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="w-8 h-8 bg-yellow-600 border-2 border-yellow-800 flex items-center justify-center mr-3">
                <span className="text-yellow-900 text-sm">📚</span>
              </div>
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-yellow-100 border-4 border-yellow-100 hover:bg-yellow-100 hover:text-yellow-900 font-bold text-lg rounded-lg transition-all transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-yellow-600 border-2 border-yellow-800 flex items-center justify-center mr-3">
                <span className="text-yellow-900 text-sm">🔑</span>
              </div>
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-yellow-600 mb-12">
            Why Choose Bookshelf?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg border-4 border-yellow-600 hover:border-yellow-400 transition-all transform hover:scale-105 shadow-lg">
              <div className="w-16 h-16 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center mx-auto mb-6">
                <span className="text-yellow-900 text-2xl">📖</span>
              </div>
              <h3 className="text-yellow-600 font-bold text-xl mb-4 text-center">Track Your Books</h3>
              <p className="text-gray-600 text-center">
                Add books to your library, track reading progress, manage your wishlist, and never lose track of what you&#39;re reading.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border-4 border-yellow-600 hover:border-yellow-400 transition-all transform hover:scale-105 shadow-lg">
              <div className="w-16 h-16 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center mx-auto mb-6">
                <span className="text-yellow-900 text-2xl">📝</span>
              </div>
              <h3 className="text-yellow-600 font-bold text-xl mb-4 text-center">Take Notes</h3>
              <p className="text-gray-600 text-center">
                Write and organize notes for each book. Keep your thoughts, insights, and favorite quotes in one place.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border-4 border-yellow-600 hover:border-yellow-400 transition-all transform hover:scale-105 shadow-lg">
              <div className="w-16 h-16 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center mx-auto mb-6">
                <span className="text-yellow-900 text-2xl">📊</span>
              </div>
              <h3 className="text-yellow-600 font-bold text-xl mb-4 text-center">View Statistics</h3>
              <p className="text-gray-600 text-center">
                Analyze your reading habits with detailed charts and statistics. See your progress over time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border-4 border-yellow-600 hover:border-yellow-400 transition-all transform hover:scale-105 shadow-lg">
              <div className="w-16 h-16 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center mx-auto mb-6">
                <span className="text-yellow-900 text-2xl">🌐</span>
              </div>
              <h3 className="text-yellow-600 font-bold text-xl mb-4 text-center">Share Your Profile</h3>
              <p className="text-gray-600 text-center">
                Create a custom profile URL and share your reading journey with friends and family.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border-4 border-yellow-600 hover:border-yellow-400 transition-all transform hover:scale-105 shadow-lg">
              <div className="w-16 h-16 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center mx-auto mb-6">
                <span className="text-yellow-900 text-2xl">🔒</span>
              </div>
              <h3 className="text-yellow-600 font-bold text-xl mb-4 text-center">Secure & Private</h3>
              <p className="text-gray-600 text-center">
                Your data is secure with encrypted passwords and private by default. Share only what you want.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg border-4 border-yellow-600 hover:border-yellow-400 transition-all transform hover:scale-105 shadow-lg">
              <div className="w-16 h-16 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center mx-auto mb-6">
                <span className="text-yellow-900 text-2xl">📱</span>
              </div>
              <h3 className="text-yellow-600 font-bold text-xl mb-4 text-center">Mobile Friendly</h3>
              <p className="text-gray-600 text-center">
                Responsive design works perfectly on all devices - desktop, tablet, and mobile phones.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-16 px-8 border-t-4 border-yellow-600">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-yellow-600 mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-yellow-900">
                1
              </div>
              <h3 className="text-yellow-600 font-bold text-xl mb-2">Create Account</h3>
              <p className="text-gray-600">
                Sign up with your email and create a secure password to get started.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-yellow-900">
                2
              </div>
              <h3 className="text-yellow-600 font-bold text-xl mb-2">Add Your Books</h3>
              <p className="text-gray-600">
                Start adding books to your library and track your reading progress.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-600 border-4 border-yellow-800 flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-yellow-900">
                3
              </div>
              <h3 className="text-yellow-600 font-bold text-xl mb-2">Enjoy & Share</h3>
              <p className="text-gray-600">
                Take notes, view statistics, and share your reading journey with others.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="py-16 px-8 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-yellow-600 mb-8">Built With Modern Technologies</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-6 py-3 bg-white border-2 border-yellow-600 rounded-lg font-semibold text-gray-700 hover:bg-yellow-50 transition-colors">Next.js 15</span>
            <span className="px-6 py-3 bg-white border-2 border-yellow-600 rounded-lg font-semibold text-gray-700 hover:bg-yellow-50 transition-colors">MongoDB</span>
            <span className="px-6 py-3 bg-white border-2 border-yellow-600 rounded-lg font-semibold text-gray-700 hover:bg-yellow-50 transition-colors">Tailwind CSS</span>
            <span className="px-6 py-3 bg-white border-2 border-yellow-600 rounded-lg font-semibold text-gray-700 hover:bg-yellow-50 transition-colors">TypeScript</span>
            <span className="px-6 py-3 bg-white border-2 border-yellow-600 rounded-lg font-semibold text-gray-700 hover:bg-yellow-50 transition-colors">Recharts</span>
            <span className="px-6 py-3 bg-white border-2 border-yellow-600 rounded-lg font-semibold text-gray-700 hover:bg-yellow-50 transition-colors">JWT Auth</span>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-8 bg-yellow-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Reading Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of readers who are already using Bookshelf to track their reading progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-yellow-900 text-yellow-100 border-4 border-yellow-800 hover:bg-yellow-800 font-bold text-lg rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="w-8 h-8 bg-yellow-600 border-2 border-yellow-800 flex items-center justify-center mr-3">
                <span className="text-yellow-900 text-sm">📚</span>
              </div>
              Start Reading Today
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-yellow-100 border-4 border-yellow-100 hover:bg-yellow-100 hover:text-yellow-900 font-bold text-lg rounded-lg transition-all transform hover:scale-105"
            >
              <div className="w-8 h-8 bg-yellow-600 border-2 border-yellow-800 flex items-center justify-center mr-3">
                <span className="text-yellow-900 text-sm">🔑</span>
              </div>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
