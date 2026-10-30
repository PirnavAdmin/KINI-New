import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Loader2, CheckCircle, BarChart3, FileText, Sparkles
} from 'lucide-react'

const EVALUATION_STEPS = [
  { icon: CheckCircle, label: 'Evaluating Answers', duration: 800 },
  { icon: BarChart3, label: 'Calculating Score', duration: 600 },
  { icon: FileText, label: 'Preparing Analytics', duration: 700 },
  { icon: Sparkles, label: 'Generating Report', duration: 500 },
]

export default function AssessmentEvaluation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  const resultsData = location.state

  useEffect(() => {
    if (!resultsData) {
      navigate(`/student/assessments/${id}/instructions`, { replace: true })
      return
    }

    let totalDuration = 0
    const stepTimers = []

    EVALUATION_STEPS.forEach((step, i) => {
      totalDuration += step.duration
      stepTimers.push(setTimeout(() => setCurrentStep(i + 1), totalDuration))
    })

    // Progress bar
    const totalTime = EVALUATION_STEPS.reduce((a, s) => a + s.duration, 0)
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(100, prev + (100 / (totalTime / 50))))
    }, 50)

    // Navigate to results
    const finalTimer = setTimeout(() => {
      navigate(`/student/assessments/${id}/results`, {
        state: resultsData,
        replace: true,
      })
    }, totalTime + 300)

    return () => {
      stepTimers.forEach(t => clearTimeout(t))
      clearInterval(progressInterval)
      clearTimeout(finalTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!resultsData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1121] via-[#0F172A] to-[#0B1121] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo/animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-[#0f55f7] via-[#06b6a8] to-[#EC4899] flex items-center justify-center mx-auto shadow-2xl shadow-[#0f55f7]/20 relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-12 h-12 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-[28px] bg-white/10"
            />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-white mb-2"
        >
          Evaluating Your Assessment
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-slate-400 mb-8"
        >
          Please wait while we process your answers
        </motion.p>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] via-[#06b6a8] to-[#EC4899]"
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4">
          {EVALUATION_STEPS.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                i < currentStep
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : i === currentStep
                  ? 'bg-[#0f55f7]/10 border border-[#0f55f7]/20'
                  : 'bg-white/5 border border-white/5 opacity-40'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                i < currentStep ? 'bg-emerald-500' :
                i === currentStep ? 'bg-[#0f55f7]' :
                'bg-white/10'
              }`}>
                {i < currentStep ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : i === currentStep ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <step.icon className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                i < currentStep ? 'text-emerald-400' :
                i === currentStep ? 'text-white' :
                'text-slate-500'
              }`}>
                {step.label}
              </span>
              {i < currentStep && (
                <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

