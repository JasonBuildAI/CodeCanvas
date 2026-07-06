import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { codePieceApi } from '../services/codePieceApi'
import GalleryGrid from '../components/gallery/GalleryGrid'
import type { CodePiece } from '../types'
import { User } from 'lucide-react'

export default function UserProfile() {
  const { id } = useParams()
  const [pieces, setPieces] = useState<CodePiece[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    codePieceApi.list({ page: 1 })
      .then((res) => {
        const userPieces = res.data.filter((p) => p.user_id === Number(id))
        setPieces(userPieces)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-indigo-900/50 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">User #{id}</h1>
          <p className="text-sm text-gray-400">{pieces.length} pieces</p>
        </div>
      </div>
      <GalleryGrid pieces={pieces} loading={loading} />
    </div>
  )
}
