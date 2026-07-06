import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { CodePiece } from '../../types'
import { Heart, Eye, GitFork, User } from 'lucide-react'

interface Props {
  pieces: CodePiece[]
  loading: boolean
}

export default function GalleryGrid({ pieces, loading }: Props) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-gray-800">
            <div className="h-48 shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-4 shimmer rounded w-3/4" />
              <div className="h-3 shimmer rounded w-1/2" />
              <div className="flex gap-2">
                <div className="h-5 shimmer rounded-full w-14" />
                <div className="h-5 shimmer rounded-full w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (pieces.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center border border-indigo-500/10">
          <Code2Icon className="w-10 h-10 text-indigo-400/50" />
        </div>
        <p className="text-xl font-semibold text-gray-300 mb-2">{t('user.noPieces')}</p>
        <p className="text-gray-500 mb-8">{t('user.beFirst')}</p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all"
        >
          <PenSquareIcon className="w-4 h-4" />
          {t('user.createFirst')}
        </Link>
      </div>
    )
  }

  // Assign random gradient colors based on piece id for visual variety
  const gradients = [
    'from-pink-500/10 to-rose-500/10',
    'from-indigo-500/10 to-purple-500/10',
    'from-emerald-500/10 to-teal-500/10',
    'from-orange-500/10 to-yellow-500/10',
    'from-cyan-500/10 to-blue-500/10',
    'from-violet-500/10 to-fuchsia-500/10',
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {pieces.map((piece, idx) => (
        <Link
          key={piece.id}
          to={`/piece/${piece.id}`}
          className="group relative bg-gray-900/60 rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-500/40 transition-all duration-300 card-glow"
        >
          {/* Preview area */}
          <div className={`h-48 bg-gradient-to-br ${gradients[idx % gradients.length]} overflow-hidden relative`}>
            {piece.html_code || piece.css_code ? (
              <iframe
                className="w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                sandbox="allow-scripts"
                srcDoc={`<html><head><style>${piece.css_code}</style></head><body>${piece.html_code}<script>${piece.js_code}</script></body></html>`}
                title={piece.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Code2Icon className="w-12 h-12 text-gray-700" />
              </div>
            )}
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold truncate group-hover:text-indigo-400 transition-colors">
              {piece.title || t('editor.title')}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <User className="w-3 h-3" />
              {piece.author?.username || t('piece.anonymous')}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1 hover:text-red-400 transition-colors">
                <Heart className="w-3.5 h-3.5" /> {piece.like_count}
              </span>
              <span className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                <Eye className="w-3.5 h-3.5" /> {piece.view_count}
              </span>
              <span className="flex items-center gap-1 hover:text-emerald-400 transition-colors">
                <GitFork className="w-3.5 h-3.5" /> {piece.fork_count}
              </span>
            </div>

            {/* Tags */}
            {piece.tags && piece.tags.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {piece.tags.slice(0, 3).map((t) => (
                  <span
                    key={t.name}
                    className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/10"
                  >
                    #{t.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

// Inline SVG icons to avoid import complexity
function Code2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  )
}

function PenSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}
