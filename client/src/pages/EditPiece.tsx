import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import EditorPanel from '../components/editor/EditorPanel'
import PreviewFrame from '../components/editor/PreviewFrame'
import { codePieceApi } from '../services/codePieceApi'
import type { CodePiece } from '../types'
import { Save, ArrowLeft } from 'lucide-react'

export default function EditPiece() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [piece, setPiece] = useState<CodePiece | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [htmlCode, setHtmlCode] = useState('')
  const [cssCode, setCssCode] = useState('')
  const [jsCode, setJsCode] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (id) {
      codePieceApi.getById(Number(id))
        .then((p) => {
          setPiece(p)
          setTitle(p.title)
          setDescription(p.description)
          setHtmlCode(p.html_code)
          setCssCode(p.css_code)
          setJsCode(p.js_code)
          setIsPublic(p.is_public === 1)
        })
        .catch(() => navigate('/'))
        .finally(() => setLoading(false))
    }
  }, [id, isAuthenticated, navigate])

  const handleSave = async () => {
    if (!piece) return
    setSaving(true)
    try {
      await codePieceApi.update(piece.id, {
        title: title || 'Untitled',
        description,
        html_code: htmlCode,
        css_code: cssCode,
        js_code: jsCode,
        is_public: isPublic,
      })
      navigate(`/piece/${piece.id}`)
    } catch (err) {
      console.error('Failed to update:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-lg font-medium border-b border-gray-700 focus:border-indigo-500 outline-none pb-1 w-64"
          />
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Public
          </label>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 flex flex-col gap-4">
          <EditorPanel
            htmlCode={htmlCode}
            cssCode={cssCode}
            jsCode={jsCode}
            onHtmlChange={setHtmlCode}
            onCssChange={setCssCode}
            onJsChange={setJsCode}
          />
        </div>
        <div className="w-1/2 bg-white rounded-lg overflow-hidden">
          <PreviewFrame htmlCode={htmlCode} cssCode={cssCode} jsCode={jsCode} />
        </div>
      </div>
    </div>
  )
}
