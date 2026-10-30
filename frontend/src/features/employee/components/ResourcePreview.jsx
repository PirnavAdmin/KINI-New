import { useEffect, useRef, useState } from 'react'

function PdfPreview({ blob }) {
  const canvas = useRef(null)
  const [document, setDocument] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    let task
    async function load() {
      try {
        const [pdfjs, worker] = await Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')])
        if (!active) return
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default
        const data = await blob.arrayBuffer()
        if (!active) return
        task = pdfjs.getDocument({ data })
        const pdf = await task.promise
        if (active) setDocument(pdf)
      } catch {
        if (active) { setError('This PDF could not be displayed. Try downloading it or ask HR to replace the file.'); setLoading(false) }
      }
    }
    load()
    return () => { active = false; task?.destroy() }
  }, [blob])
  useEffect(() => {
    if (!document) return
    let active = true
    let renderTask
    setLoading(true)
    async function render() {
      try {
        const pdfPage = await document.getPage(page)
        if (!active) return
        const viewport = pdfPage.getViewport({ scale: 1.5 })
        const element = canvas.current
        element.width = viewport.width
        element.height = viewport.height
        renderTask = pdfPage.render({ canvasContext: element.getContext('2d'), viewport })
        await renderTask.promise
        if (active) setLoading(false)
      } catch (error) {
        if (active && error.name !== 'RenderingCancelledException') { setError('Unable to render this PDF page. Download the file to read it.'); setLoading(false) }
      }
    }
    render()
    return () => { active = false; renderTask?.cancel() }
  }, [document, page])
  return <div className="space-y-3">
    {document && <div className="flex items-center justify-center gap-4 text-sm"><button disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)} className="rounded-lg border bg-white px-3 py-1.5 text-slate-800 disabled:opacity-40">Previous page</button><span>Page {page} of {document.numPages}</span><button disabled={page === document.numPages || loading} onClick={() => setPage(p => p + 1)} className="rounded-lg border bg-white px-3 py-1.5 text-slate-800 disabled:opacity-40">Next page</button></div>}
    {loading && <p role="status" className="text-center text-sm">Rendering PDF…</p>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <canvas ref={canvas} aria-label={`PDF page ${page}`} className={`mx-auto h-auto max-w-full bg-white shadow-sm ${loading || error ? 'hidden' : ''}`} />
  </div>
}

export default function ResourcePreview({ file }) {
  const [content, setContent] = useState({})
  const mime = file.blob.type.split(';')[0]
  const isImage = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(mime)
  const isText = mime.startsWith('text/') || /\.(txt|csv|json|js|mjs|cjs|jsx|ts|tsx|py|md|css|sql)$/i.test(file.filename)
  useEffect(() => {
    let active = true
    let url
    if (isImage) { url = URL.createObjectURL(file.blob); setContent({ url }) }
    else if (isText) file.blob.slice(0, 200000).text().then(text => { if (active) setContent({ text }) }).catch(() => { if (active) setContent({ error: 'Unable to read this file.' }) })
    return () => { active = false; if (url) URL.revokeObjectURL(url) }
  }, [file, isImage, isText])
  if (file.pdf) return <PdfPreview blob={file.blob} />
  if (isImage) return content.url ? <img src={content.url} alt="Resource preview" className="mx-auto max-h-[60vh] max-w-full object-contain" /> : <p role="status">Loading image…</p>
  if (isText) return <><pre className="overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#133b5d] p-5 font-mono text-sm text-white">{content.text ?? content.error ?? 'Loading text…'}</pre>{file.blob.size > 200000 && <p className="text-sm">Showing the beginning of this file. Download for the complete content.</p>}</>
  return <p className="py-12 text-center text-sm">This file format cannot be previewed here. Use Download to open it on your device.</p>
}
