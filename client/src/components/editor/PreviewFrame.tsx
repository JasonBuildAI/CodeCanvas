import { useMemo } from 'react'

interface Props {
  htmlCode: string
  cssCode: string
  jsCode: string
}

export default function PreviewFrame({ htmlCode, cssCode, jsCode }: Props) {
  const srcDoc = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>${jsCode}</script>
</body>
</html>`
  }, [htmlCode, cssCode, jsCode])

  return (
    <iframe
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      title="Preview"
    />
  )
}
