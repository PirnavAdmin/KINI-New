import { useState } from 'react'
import { Award, Download, ExternalLink, Eye, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'

const certificates = [
  { id: 1, title: 'Full Stack Web Development', issuer: 'Kini EduHub', date: 'Dec 2024', credential: 'KINI-FS-2024-001', grade: 'A' },
  { id: 2, title: 'Python for Data Science', issuer: 'Kini EduHub', date: 'Nov 2024', credential: 'KINI-PY-2024-015', grade: 'A-' },
  { id: 3, title: 'React Development Fundamentals', issuer: 'Kini EduHub', date: 'Oct 2024', credential: 'KINI-RC-2024-008', grade: 'B+' },
]

export default function EmployeeCertificates() {
  const [viewingCertificate, setViewingCertificate] = useState(null)

  const handleDownload = (c) => {
    toast.success(`Downloading "${c.title}" certificate...`)
  }

  const handleShare = (c) => {
    navigator.clipboard.writeText(`https://verify.example.com/${c.credential}`)
    toast.success('Certificate link copied!')
  }

  const handleView = (c) => {
    setViewingCertificate(c)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 sm:py-5 lg:py-6">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">Certificates</h1>
      <p className="text-sm text-slate-500 mb-6">Your earned certificates</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-700/40 bg-white dark:bg-slate-900/60 p-5 hover:shadow-md hover:border-blue-500/25 transition-all cursor-pointer group"
            onClick={() => handleView(c)}>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center mb-4"><Award className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{c.title}</h3>
            <p className="text-xs text-slate-400">{c.issuer} · {c.date}</p>
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/30">
              <span className="text-xs text-slate-400">Grade: <span className="font-bold text-slate-700 dark:text-slate-300">{c.grade}</span></span>
              <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => handleDownload(c)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors" title="Download">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare(c)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors" title="Share">
                  <Share2 className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleView(c) }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-purple-500 transition-colors" title="View">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Certificate Modal */}
      <Modal open={!!viewingCertificate} onClose={() => setViewingCertificate(null)} title={viewingCertificate?.title} description="Certificate details" size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setViewingCertificate(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Close</button>
            <button onClick={() => handleShare(viewingCertificate)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={() => { handleDownload(viewingCertificate); setViewingCertificate(null) }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        }>
        {viewingCertificate && (
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 border border-amber-200/50 dark:border-amber-500/20 p-6 text-center">
              <Award className="w-16 h-16 mx-auto mb-3 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{viewingCertificate.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{viewingCertificate.issuer}</p>
              <div className="mt-4 inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs font-bold">{viewingCertificate.grade}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3 text-center">
                <p className="text-xs text-slate-400">Date Issued</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{viewingCertificate.date}</p>
              </div>
              <div className="rounded-lg border border-slate-100 dark:border-slate-700/30 p-3 text-center">
                <p className="text-xs text-slate-400">Credential ID</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5 truncate">{viewingCertificate.credential}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
