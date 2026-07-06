import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { codePieceApi } from '../services/codePieceApi'
import GalleryGrid from '../components/gallery/GalleryGrid'
import type { CodePiece } from '../types'
import { Search } from 'lucide-react'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [searchInput, setSearchInput] = useState(query)
  const [pieces, setPieces] = useState<CodePiece[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    codePieceApi.search({ q: query })
      .then((res) => setPieces(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ q: searchInput })
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search code pieces..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </form>

      {query && (
        <p className="text-sm text-gray-400 mb-4">
          Results for: <span className="text-white font-medium">{query}</span>
        </p>
      )}

      <GalleryGrid pieces={pieces} loading={loading} />
    </div>
  )
}
