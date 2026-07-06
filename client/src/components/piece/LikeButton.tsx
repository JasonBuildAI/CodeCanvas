import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { Heart } from 'lucide-react'

interface Props {
  pieceId: number
  initialCount: number
}

export default function LikeButton({ pieceId, initialCount }: Props) {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [toggling, setToggling] = useState(false)

  const handleToggle = async () => {
    if (!isAuthenticated) return navigate('/login')
    setToggling(true)
    try {
      if (liked) {
        await api.delete(`/code-pieces/${pieceId}/like`)
        setLiked(false)
        setCount((c) => c - 1)
      } else {
        await api.post(`/code-pieces/${pieceId}/like`)
        setLiked(true)
        setCount((c) => c + 1)
      }
    } catch {
      // revert
    } finally {
      setToggling(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={toggling}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        liked
          ? 'bg-red-900/30 text-red-400 border border-red-800'
          : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
      }`}
    >
      <Heart className={`w-5 h-5 ${liked ? 'fill-red-400' : ''}`} />
      <span>{count}</span>
    </button>
  )
}
