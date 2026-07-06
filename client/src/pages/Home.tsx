import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { codePieceApi } from '../services/codePieceApi'
import GalleryGrid from '../components/gallery/GalleryGrid'
import type { CodePiece } from '../types'
import { Sparkles, ArrowRight, Code2, PenSquare, Users, Zap } from 'lucide-react'

export default function Home() {
  const { t } = useTranslation()
  const [pieces, setPieces] = useState<CodePiece[]>([])
  const [trending, setTrending] = useState<CodePiece[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    codePieceApi.trending().then(setTrending).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    codePieceApi.list({ page })
      .then((res) => {
        setPieces(res.data)
        setTotalPages(res.total_pages)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div>
      {/* 🚀 Hero Section */}
      <section className="relative overflow-hidden rounded-2xl mb-12 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 border border-indigo-800/30">
        <div className="absolute inset-0 bg-dots opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />

        <div className="relative px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
            <Zap className="w-4 h-4" />
            {t('app.tagline')}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            {t('app.tagline').split('&')[0]}&{' '}
            <span className="gradient-text">{t('app.tagline').includes('Inspire') ? 'Inspire' : '启发'}</span>
            <br />
            {t('app.tagline').split('Inspire')[1]?.trim() || 'with Code'}
          </h1>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('app.description')}
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-semibold text-white transition-all shadow-lg shadow-indigo-600/25"
            >
              <PenSquare className="w-5 h-5" />
              {t('home.startCreating')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 glass glass-hover rounded-xl font-medium text-gray-300"
            >
              <Code2 className="w-5 h-5" />
              {t('home.explore')}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-10 pt-8 border-t border-white/5">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text">{pieces.length + trending.length}</div>
              <div className="text-xs text-gray-500 mt-1">{t('app.stats.creations')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">Live</div>
              <div className="text-xs text-gray-500 mt-1">{t('app.stats.preview')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">∞</div>
              <div className="text-xs text-gray-500 mt-1">{t('app.stats.possibilities')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 Trending Section */}
      {trending.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold">{t('home.trending')}</h2>
            </div>
            <Link to="/search" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              {t('home.viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trending.slice(0, 3).map((piece, idx) => (
              <Link
                key={piece.id}
                to={`/piece/${piece.id}`}
                className="group relative bg-gray-900/80 rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-500/40 transition-all card-glow"
              >
                {/* Rank badge */}
                <div className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-gray-900 shadow-lg">
                  {idx + 1}
                </div>

                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden relative">
                  <iframe
                    className="w-full h-full pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity"
                    sandbox="allow-scripts"
                    srcDoc={`<html><head><style>${piece.css_code}</style></head><body>${piece.html_code}<script>${piece.js_code}</script></body></html>`}
                    title={piece.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                </div>

                <div className="p-4 relative">
                  <h3 className="font-semibold truncate group-hover:text-indigo-400 transition-colors">
                    {piece.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {piece.author?.username || 'Anonymous'}
                  </p>
                  {piece.tags && piece.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {piece.tags.slice(0, 3).map((t) => (
                        <span key={t.name} className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/10">
                          #{t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 🖼️ Gallery */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
              <Code2 className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold">{t('home.gallery')}</h2>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm bg-gray-800 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-colors"
              >
                {t('home.prev')}
              </button>
              <span className="text-sm text-gray-500 px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm bg-gray-800 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-colors"
              >
                {t('home.next')}
              </button>
            </div>
          )}
        </div>

        <GalleryGrid pieces={pieces} loading={loading} />
      </section>
    </div>
  )
}
