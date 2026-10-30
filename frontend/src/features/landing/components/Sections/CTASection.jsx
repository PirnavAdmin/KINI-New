import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import useScrollAnimation from '../../hooks/useScrollAnimation'

export default function CTASection({ onOpenEnquiry }) {
  const ref = useScrollAnimation({ animation: 'scaleIn' })

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/20 via-[#7C3AED]/10 to-[#06B6D4]/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.15),transparent_60%)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2563EB]/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/50 to-transparent" />

      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(37,99,235,0.3)]"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-3xl sm:text-4xl font-black text-white">
          Ready to{' '}
          <span className="bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#06B6D4] bg-clip-text text-transparent">
            transform your career?
          </span>
        </h2>
        <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
          Join 20,000+ students who've launched their tech careers. Your journey starts today.
        </p>

        <motion.button
          onClick={onOpenEnquiry}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white font-bold text-sm shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transition-all duration-300"
        >
          Book Free Consultation
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </section>
  )
}
