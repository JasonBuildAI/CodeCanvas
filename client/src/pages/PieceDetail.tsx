import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { codePieceApi } from '../services/codePieceApi'
import { useAuthStore } from '../stores/authStore'
import LikeButton from '../components/piece/LikeButton'
import CommentSection from '../components/piece/CommentSection'
import type { CodePiece } from '../types'
import { Edit3, GitFork, Eye, Heart, MessageSquare, ExternalLink, ArrowLeft, Clock, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function PieceDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [piece, setPiece] = useState<CodePiece | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      codePieceApi.getById(Number(id))
        .then(setPiece)
        .catch(() => navigate('/'))
        .finally(() => setLoading(false))
    }
  }, [id, navigate])

  const handleFork = async () => {
    if (!piece || !isAuthenticated) return navigate('/login')
    try {
      const res = await codePieceApi.create({
        title: `${piece.title} (Fork)`,
        description: piece.description,
        html_code: piece.html_code,
        css_code: piece.css_code,
        js_code: piece.js_code,
        is_public: true,
        tags: [],
      })
      navigate(`/piece/${res.id}`)
    } catch (err) {
      console.error('Fork failed:', err)
    }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center py-20 text-gray-400">{t('common.loading')}</div>
    </div>
  )

  if (!piece) return (
    <div className="text-center py-20">
      <p className="text-gray-500">{t('piece.notFound')}</p>
      <Link to="/" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">{t('piece.backToHome')}</Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t('piece.back')}
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold truncate">{piece.title || 'Untitled'}</h1>
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400 flex-wrap">
            <Link to={`/user/${piece.user_id}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <User className="w-4 h-4" />
              {piece.author?.username || t('piece.anonymous')}
            </Link>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-400/70" /> {piece.view_count}
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-400/70" /> {piece.like_count}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400/70" /> {piece.comment_count}
            </span>
            <span className="flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-violet-400/70" /> {piece.fork_count}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {new Date(piece.created_at).toLocaleDateString()}
            </span>
          </div>
          {piece.description && (
            <p className="text-gray-400 mt-3 text-sm leading-relaxed">{piece.description}</p>
          )}
          {piece.tags && piece.tags.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {piece.tags.map((t) => (
                <span key={t.name} className="px-3 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/10">
                  #{t.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated && user?.id === piece.user_id && (
            <Link to={`/edit/${piece.id}`} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-xl transition-all">
              <Edit3 className="w-4 h-4" /> {t('piece.edit')}
            </Link>
          )}
          <button onClick={handleFork} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-violet-600/20">
            <GitFork className="w-4 h-4" /> {t('piece.fork')}
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-xl overflow-hidden border border-gray-800 mb-8 shadow-2xl shadow-black/30" style={{ minHeight: 400 }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 border-b border-gray-800">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs text-gray-500 ml-3">{t('piece.livePreview')}</span>
        </div>
        <div className="bg-white">
          <iframe
            className="w-full h-[500px]"
            sandbox="allow-scripts"
            srcDoc={`<!DOCTYPE html><html><head><style>${piece.css_code}</style></head><body>${piece.html_code}<script>${piece.js_code}</script></body></html>`}
            title={piece.title}
          />
        </div>
      </div>

      {/* Code Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'HTML', code: piece.html_code, color: 'border-orange-500/30', headerColor: 'text-orange-400' },
          { label: 'CSS', code: piece.css_code, color: 'border-blue-500/30', headerColor: 'text-blue-400' },
          { label: 'JS', code: piece.js_code, color: 'border-yellow-500/30', headerColor: 'text-yellow-400' },
        ].map(({ label, code, color, headerColor }) => (
          <div key={label} className={`rounded-xl border ${color} bg-gray-900/80 overflow-hidden`}>
            <div className={`px-4 py-2 border-b ${color} ${headerColor} text-xs font-semibold uppercase tracking-wider`}>
              {label}
            </div>
            <pre className="p-4 text-xs text-gray-300 overflow-auto max-h-72 font-mono leading-relaxed">{code || <span className="text-gray-600 italic">{t('piece.empty')}</span>}</pre>
          </div>
        ))}
      </div>

      {/* Interactions */}
      <div className="flex items-center gap-4 mb-8 p-4 glass rounded-xl">
        <LikeButton pieceId={piece.id} initialCount={piece.like_count} />
      </div>

      {/* Comments */}
      <CommentSection pieceId={piece.id} />
    </div>
  )
}
