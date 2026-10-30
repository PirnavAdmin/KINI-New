import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Briefcase, Search, MapPin, DollarSign, Clock,
  Heart, ExternalLink, Building2, Star, ArrowUpRight, CheckCircle
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import { dashboardApi } from '@shared/services/apiServices'

export default function StudentJobPortal() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [likedJobs, setLikedJobs] = useState(new Set())
  const [appliedJobs, setAppliedJobs] = useState(new Set())

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await dashboardApi.studentDashboard()
      const liveJobs = data?.jobs ?? data?.jobListings ?? data?.careerMatches ?? []
      setJobs(Array.isArray(liveJobs) ? liveJobs : [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load jobs.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const toggleLike = (jobId) => {
    setLikedJobs(prev => {
      const next = new Set(prev)
      if (next.has(jobId)) next.delete(jobId)
      else next.add(jobId)
      return next
    })
  }

  const handleApply = (job) => {
    if (appliedJobs.has(job.id)) return
    setAppliedJobs(prev => new Set(prev).add(job.id))
    toast.success(`Applied to ${job.title} at ${job.company}`)
  }

  const filtered = useMemo(() => {
    return jobs.filter(job => {
      if (filterType !== 'all' && job.type !== filterType) return false
      if (search && !String(job.title || '').toLowerCase().includes(search.toLowerCase()) && !String(job.company || '').toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [jobs, search, filterType])

  return (
    <div className="w-full max-w-none px-4 sm:px-5 lg:px-6 py-4 sm:py-5 lg:py-6">
      <PageHeader
        title="Job Portal"
        subtitle={`${jobs.length} jobs matched to your skills`}
        icon={Briefcase}
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search jobs by title or company..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
        >
          <option value="all">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Internship">Internship</option>
        </select>
      </div>

      {/* Job Listings */}
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))
        ) : error ? (
          <div className="text-center py-16 text-sm text-red-500">{error}</div>
        ) : filtered.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/40 rounded-xl p-4 sm:p-5 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-[#0f55f7]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0f55f7] transition-colors">{job.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-[#06b6a8]/20 self-start">
                    {job.matchScore}% Match
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{job.company}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{job.salary}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.type}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.postedDate}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(job.skills ?? []).map((skill) => (
                    <span key={skill} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => toggleLike(job.id)} className={`p-2 rounded-xl border transition-colors ${likedJobs.has(job.id) ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20' : 'border-slate-200 dark:border-slate-700 hover:bg-[#0f55f7]/5 hover:border-[#0f55f7]/30'}`}>
                  <Heart className={`w-4 h-4 ${likedJobs.has(job.id) ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                </button>
                <button onClick={() => handleApply(job)} disabled={appliedJobs.has(job.id)} className={`p-2 rounded-xl transition-colors ${appliedJobs.has(job.id) ? 'bg-emerald-500 text-white cursor-default' : 'bg-[#0f55f7] text-white hover:bg-[#0b3fc4]'}`}>
                  {appliedJobs.has(job.id) ? <CheckCircle className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-400">No jobs match your search</p>
        </div>
      )}
    </div>
  )
}



