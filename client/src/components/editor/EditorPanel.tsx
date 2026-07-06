import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

interface Props {
  htmlCode: string
  cssCode: string
  jsCode: string
  onHtmlChange: (val: string) => void
  onCssChange: (val: string) => void
  onJsChange: (val: string) => void
}

export default function EditorPanel({ htmlCode, cssCode, jsCode, onHtmlChange, onCssChange, onJsChange }: Props) {
  const editorHeight = '100%'

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-3 py-1.5 text-xs font-medium text-orange-400 bg-gray-800/50 border-b border-gray-800">HTML</div>
          <div className="flex-1 overflow-hidden">
            <CodeMirror
              value={htmlCode}
              onChange={onHtmlChange}
              extensions={[html()]}
              theme={oneDark}
              height={editorHeight}
              basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true }}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-gray-800/50 border-b border-gray-800">CSS</div>
          <div className="flex-1 overflow-hidden">
            <CodeMirror
              value={cssCode}
              onChange={onCssChange}
              extensions={[css()]}
              theme={oneDark}
              height={editorHeight}
              basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true }}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <div className="h-full flex flex-col bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-3 py-1.5 text-xs font-medium text-yellow-400 bg-gray-800/50 border-b border-gray-800">JavaScript</div>
          <div className="flex-1 overflow-hidden">
            <CodeMirror
              value={jsCode}
              onChange={onJsChange}
              extensions={[javascript()]}
              theme={oneDark}
              height={editorHeight}
              basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
