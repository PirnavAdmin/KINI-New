import { motion } from 'framer-motion'
import useScrollAnimation from '../../hooks/useScrollAnimation'
import { FaReact, FaPython, FaAws, FaDocker, FaNodeJs, FaFigma } from 'react-icons/fa'
import { SiTypescript, SiKubernetes, SiGraphql, SiTailwindcss, SiMongodb, SiPostgresql } from 'react-icons/si'

const companies = [
  { name: 'Google', Icon: SiTypescript }, { name: 'Meta', Icon: FaReact },
  { name: 'Amazon', Icon: FaAws }, { name: 'Microsoft', Icon: FaNodeJs },
  { name: 'Netflix', Icon: FaDocker }, { name: 'Spotify', Icon: FaPython },
]

export default function TrustedCompanies() {
  const ref = useScrollAnimation({ animation: 'fadeUp' })

  return (
    <section ref={ref} className="relative py-16 bg-[#0B1120] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 mb-8">
          Trusted by engineers from leading companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 opacity-40">
          {companies.map(({ name, Icon }) => (
            <div key={name} className="flex items-center gap-2 text-slate-400">
              <Icon className="w-5 h-5" />
              <span className="text-sm font-semibold">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
