import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Code2, LogIn, UserPlus, PlusSquare, LogOut, Search } from 'lucide-react'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-white">Code</span>
              <span className="gradient-text">Canvas</span>
            </span>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              onClick={() => navigate('/search')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-400 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition-all w-48"
            >
              <Search className="w-4 h-4" />
              <span>Search pieces...</span>
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/create"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                  <PlusSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Create</span>
                </Link>

                <Link
                  to={`/user/${user?.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white rounded-xl hover:bg-gray-800/50 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:inline">{user?.username}</span>
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-400 rounded-xl hover:bg-gray-800/50 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white rounded-xl hover:bg-gray-800/50 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
