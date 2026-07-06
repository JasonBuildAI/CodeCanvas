import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import type { Comment } from '../../types'
import { MessageSquare, Send } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Props {
  pieceId: number
}

export default function CommentSection({ pieceId }: Props) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/code-pieces/${pieceId}/comments`)
      .then((res) => setComments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [pieceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) return navigate('/login')
    if (!content.trim()) return

    try {
      const res = await api.post(`/code-pieces/${pieceId}/comments`, { content: content.trim() })
      setComments([res.data, ...comments])
      setContent('')
    } catch {
      // ignore
    }
  }

  return (
    <div className="border-t border-gray-800 pt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        {t('comments.title')} ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isAuthenticated ? t('comments.placeholder') : t('comments.loginToComment')}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!content.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">{t('comments.loading')}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">{t('comments.empty')}</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-indigo-400">
                  {comment.author?.username || t('comments.anonymous')}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-300">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
