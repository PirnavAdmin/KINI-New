import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award, Download, Share2, ArrowLeft,
  Calendar, Hash, User
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AssessmentCertificate() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const results = location.state

  const certificateData = {
    studentName: 'Srinivas Kumar',
    assessmentTitle: results?.assessment?.title || 'Assessment',
    completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    certificateId: `CERT-${id}-${Date.now().toString(36).toUpperCase()}`,
    score: results?.score || 0,
    grade: results?.score >= 90 ? 'A+' : results?.score >= 80 ? 'A' : results?.score >= 70 ? 'B' : 'C',
  }

  const handleDownload = () => {
    toast.success('Certificate PDF download started...')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(`https://verify.kinieduhub.io/${certificateData.certificateId}`)
    toast.success('Certificate link copied!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-[#0B1121] dark:to-[#0F172A] py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/student/assessments/${id}/results`, { state: results })}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Results
        </motion.button>

        {/* Certificate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Decorative border pattern */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-3 rounded-[20px] border-2 border-dashed border-[#0f55f7]/20 dark:border-[#0f55f7]/10" />
          </div>

          {/* Top decoration */}
          <div className="relative h-3 bg-gradient-to-r from-[#0f55f7] via-[#06b6a8] to-[#EC4899]" />

          <div className="relative p-8 sm:p-12 text-center">
            {/* Award Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0f55f7] via-[#06b6a8] to-[#EC4899] flex items-center justify-center shadow-2xl shadow-[#0f55f7]/20"
            >
              <Award className="w-10 h-10 text-white" />
            </motion.div>

            {/* Certificate of Completion */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0f55f7] mb-2"
            >
              Certificate of Completion
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1"
            >
              {certificateData.assessmentTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-slate-400 mb-6"
            >
              This certificate is proudly awarded to
            </motion.p>

            {/* Student Name */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-6"
            >
              <div className="inline-block border-b-2 border-dashed border-[#0f55f7]/30 dark:border-[#0f55f7]/20 px-8 pb-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {certificateData.studentName}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-2">for successfully completing the assessment</p>
            </motion.div>

            {/* Score & Grade */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center justify-center gap-6 mb-6"
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{certificateData.score}%</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Score</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#06b6a8]">{certificateData.grade}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Grade</p>
              </div>
            </motion.div>

            {/* Details Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-lg mx-auto mb-8"
            >
              {[
                { icon: User, label: 'Student', value: certificateData.studentName },
                { icon: Calendar, label: 'Completed', value: certificateData.completionDate },
                { icon: Hash, label: 'Certificate ID', value: certificateData.certificateId.slice(0, 12) + '...' },
                { icon: Award, label: 'Grade', value: certificateData.grade },
              ].map((item, i) => (
                <div key={i} className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30">
                  <item.icon className="w-4 h-4 text-[#0f55f7] mx-auto mb-1" />
                  <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate">{item.value}</p>
                  <p className="text-[9px] text-slate-400">{item.label}</p>
                </div>
              ))}
            </motion.div>

            {/* QR Code Placeholder */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex items-center justify-center gap-6 mb-6"
            >
              <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`w-3.5 h-3.5 ${i % 2 === 0 ? 'bg-slate-800 dark:bg-slate-200' : 'bg-transparent'} ${i === 4 ? 'bg-[#0f55f7]/50' : ''}`} />
                  ))}
                </div>
              </div>
              <div className="text-left text-[10px] text-slate-400">
                <p className="font-semibold text-slate-600 dark:text-slate-300">Verify this certificate</p>
                <p>Scan QR code or visit</p>
                <p className="text-[9px]">verify.kinieduhub.io</p>
              </div>
            </motion.div>

            {/* Signatures */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-8 sm:gap-16 mb-8 pt-6 border-t border-slate-100 dark:border-slate-700/30"
            >
              <div className="text-center">
                <div className="w-28 h-px bg-slate-300 dark:bg-slate-600 mb-1" />
                <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Dr. Sarah Chen</p>
                <p className="text-[9px] text-slate-400">Lead Instructor</p>
              </div>
              <div className="text-center">
                <div className="w-28 h-px bg-slate-300 dark:bg-slate-600 mb-1" />
                <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Kini EduHub</p>
                <p className="text-[9px] text-slate-400">Authorized Signature</p>
              </div>
            </motion.div>

            {/* Organization Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              className="flex items-center justify-center gap-2 mb-2"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] flex items-center justify-center">
                <span className="text-white font-bold text-[8px]">KE</span>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">Kini EduHub</span>
            </motion.div>

            {/* Organization description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-[9px] text-slate-300"
            >
              verifiable at verify.kinieduhub.io · certificate id: {certificateData.certificateId}
            </motion.p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-6"
        >
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] rounded-xl hover:brightness-110 transition-all shadow-lg shadow-[#0f55f7]/20"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={() => navigate(`/student/assessments/${id}/results`, { state: results })}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Results
          </button>
        </motion.div>
      </div>
    </div>
  )
}


