import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import EditorPanel from '../components/editor/EditorPanel'
import PreviewFrame from '../components/editor/PreviewFrame'
import { codePieceApi } from '../services/codePieceApi'
import { Save, Eye } from 'lucide-react'

export default function CreatePiece() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [htmlCode, setHtmlCode] = useState('<h1>Hello, CodeCanvas!</h1>\n<p>Start editing to see the preview.</p>')
  const [cssCode, setCssCode] = useState('body {\n  font-family: sans-serif;\n  padding: 20px;\n  background: #1a1a2e;\n  color: #eee;\n}\nh1 { color: #e94560; }')
  const [jsCode, setJsCode] = useState('// JavaScript goes here\nconsole.log("Hello from CodeCanvas!");')
  const [isPublic, setIsPublic] = useState(true)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const piece = await codePieceApi.create({
        title: title || 'Untitled',
        description,
        html_code: htmlCode,
        css_code: cssCode,
        js_code: jsCode,
        is_public: isPublic,
        tags,
      })
      navigate(`/piece/${piece.id}`)
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Piece"
            className="bg-transparent text-lg font-medium border-b border-gray-700 focus:border-indigo-500 outline-none pb-1 w-64"
          />
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            Public
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Editor' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        {tags.map((t) => (
          <span key={t} className="px-2 py-1 text-xs bg-indigo-900/50 text-indigo-300 rounded-full">
            {t}
            <button onClick={() => setTags(tags.filter((x) => x !== t))} className="ml-1 hover:text-red-400">&times;</button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
          placeholder="Add tag..."
          className="bg-gray-800 text-sm px-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-indigo-500 w-24"
        />
      </div>

      {showPreview ? (
        <div className="flex-1 bg-white rounded-lg overflow-hidden">
          <iframe
            className="w-full h-full"
            sandbox="allow-scripts"
            srcDoc={`<!DOCTYPE html><html><head><style>${cssCode}</style></head><body>${htmlCode}<script>${jsCode}</script></body></html>`}
            title="Preview"
          />
        </div>
      ) : (
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
      )}
    </div>
  )
}
