import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreatePiece from './pages/CreatePiece'
import EditPiece from './pages/EditPiece'
import PieceDetail from './pages/PieceDetail'
import UserProfile from './pages/UserProfile'
import SearchResults from './pages/SearchResults'
import NotFound from './pages/NotFound'

function App() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create" element={<CreatePiece />} />
          <Route path="/edit/:id" element={<EditPiece />} />
          <Route path="/piece/:id" element={<PieceDetail />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
