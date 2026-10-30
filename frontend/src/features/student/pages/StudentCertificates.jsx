import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Award, BadgeCheck, BookOpen, Calendar, ChevronDown, Clock3,
  Download, ExternalLink, FileBadge, GraduationCap, Medal, Search, Share2, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import StudentPageBanner from '@features/student/components/StudentPageBanner'
import { STUDENT_BANNERS } from '@features/student/constants/studentBanners'
import { dashboardApi } from '@shared/services/apiServices'
import { courseService } from '@/services/courseService'
import { getStoredCoursePercentages } from '@features/student/utils/studentProgressAccess'

const ELIGIBLE_AT = 70
const clamp = (value) => Math.min(100, Math.max(0, Number(value) || 0))
const certCourse = (cert = {}) => cert.courseName ?? cert.course ?? cert.title ?? ''

export default function StudentCertificates() {
  const navigate = useNavigate()
  const [certificates, setCertificates] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareId, setShareId] = useState(null)
  const [query, setQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')

  const loadCertificates = useCallback(async () => {
    setLoading(true)
    setError('')
    const [dashboardResult, coursesResult] = await Promise.allSettled([
      dashboardApi.studentDashboard(),
      courseService.getStudentCourses(),
    ])
    if (dashboardResult.status === 'fulfilled') {
      const data = dashboardResult.value
      const liveCertificates = data?.certificates ?? data?.certifications ?? []
      setCertificates(Array.isArray(liveCertificates) ? liveCertificates : [])
    } else {
      const err = dashboardResult.reason
      setError(err?.response?.data?.message || err?.message || 'Unable to load certificates.')
      setCertificates([])
    }
    setCourses(coursesResult.status === 'fulfilled' && Array.isArray(coursesResult.value) ? coursesResult.value : [])
    setLoading(false)
  }, [])

  useEffect(() => { queueMicrotask(loadCertificates) }, [loadCertificates])

  const courseProgress = useMemo(() => {
    const stored = getStoredCoursePercentages()
    return courses.map((course) => {
      const id = course.courseId ?? course.id
      return {
        id,
        title: course.courseName ?? course.title ?? course.name ?? 'Course',
        progress: clamp(stored[id] ?? stored[String(id)] ?? course.progress ?? course.progressPercentage),
      }
    })
  }, [courses])

  const certifiedNames = new Set(certificates.map((cert) => String(certCourse(cert)).toLowerCase()))
  const counts = {
    earned: certificates.length,
    completed: courseProgress.filter((course) => course.progress >= 100).length,
    inProgress: courseProgress.filter((course) => course.progress > 0 && course.progress < 100).length,
    eligible: courseProgress.filter((course) => course.progress >= ELIGIBLE_AT && !certifiedNames.has(course.title.toLowerCase())).length,
  }
  const show = (value) => (loading ? '—' : value)

  const visible = certificates.filter((cert) => {
    if (courseFilter !== 'all' && String(certCourse(cert)).toLowerCase() !== courseFilter) return false
    const value = query.trim().toLowerCase()
    if (!value) return true
    return [cert.title, cert.issuer, certCourse(cert), ...(cert.skills ?? [])].filter(Boolean).join(' ').toLowerCase().includes(value)
  })
  const courseOptions = [...new Set([...courseProgress.map((course) => course.title), ...certificates.map(certCourse)].filter(Boolean))]

  const verifyUrl = (id) => `https://verify.example.com/${id}`
  const handleDownload = (cert) => {
    const url = cert.downloadUrl ?? cert.certificateUrl ?? cert.fileUrl
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    else toast('The certificate file will be available once your organization publishes it.')
  }

  const stats = [
    { key: 'earned', label: 'Certificates Earned', value: counts.earned, Icon: FileBadge, tone: 'blue' },
    { key: 'completed', label: 'Courses Completed', value: counts.completed, Icon: GraduationCap, tone: 'green' },
    { key: 'progress', label: 'In Progress', value: counts.inProgress, Icon: Clock3, tone: 'orange' },
    { key: 'eligible', label: 'Eligible for Certificate', value: counts.eligible, Icon: BadgeCheck, tone: 'violet' },
  ]

  return (
    <main className="ksl-page w-full px-2 py-2 sm:px-3">
      <StudentPageBanner
        banner={STUDENT_BANNERS.certificates}
        icon={Award}
        eyebrow="Certificates"
        title="Earn Certificates,"
        highlight="Showcase Your Achievements!"
        highlightBreak
        description={<>Complete your courses, gain new skills, and collect certificates<br className="ksl-hide-sm" /> to build a brighter future.</>}
      />

      <div className="ksx-stack">
        <div className="ksx-stats">
          {stats.map(({ key, label, value, Icon, tone }) => (
            <div key={key} className={`ksx-stat ksx-stat--tint ksx-stat--${tone}`}>
              <span className={`ksx-stat__icon ksl-tone--${tone}`}><Icon /></span>
              <div className="ksx-stat__body"><p className="ksx-stat__value" style={{ marginTop: 0 }}>{show(value)}</p><p className="ksx-stat__label">{label}</p></div>
            </div>
          ))}
        </div>

        <section className="ksl-card">
          <div className="ksx-head">
            <div className="ksx-head__main">
              <span className="ksx-head__icon ksl-tone--orange"><Medal /></span>
              <div><h2 className="ksx-head__title">My Certificates</h2><p className="ksx-head__sub">All your earned certificates will appear here. Download and share them to showcase your skills.</p></div>
            </div>
            <div className="ksx-head__main">
              <label className="ksx-field" style={{ width: '19rem', maxWidth: '100%' }}><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search certificates..." aria-label="Search certificates" /></label>
              <label className="ksx-field" style={{ width: '12.5rem' }}>
                <BookOpen aria-hidden="true" />
                <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} aria-label="Filter by course">
                  <option value="all">All Courses</option>
                  {courseOptions.map((name) => <option key={name} value={name.toLowerCase()}>{name}</option>)}
                </select>
                <ChevronDown aria-hidden="true" className="ksx-field__chevron" />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="ksx-cert-grid">{[0, 1, 2].map((index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-100" />)}</div>
          ) : error ? (
            <div className="ksx-alert ksx-alert--error" style={{ marginTop: '1rem' }}><span>{error}</span><button type="button" onClick={loadCertificates} className="ksl-btn ksl-btn--orange">Retry</button></div>
          ) : visible.length ? (
            <div className="ksx-cert-grid">
              {visible.map((cert, index) => (
                <motion.article key={cert.id ?? index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }} className="ksl-card ksx-cert">
                  <div className="ksx-cert__top"><Medal /><h3>{cert.title}</h3>{cert.issuer && <p>{cert.issuer}</p>}</div>
                  <div className="ksx-cert__body">
                    {cert.issueDate && <p className="ksx-list__sub"><Calendar className="mr-1 inline h-3.5 w-3.5" />Issued: {cert.issueDate}</p>}
                    {cert.expiryDate && <p className="ksx-list__sub"><Calendar className="mr-1 inline h-3.5 w-3.5" />Expires: {cert.expiryDate}</p>}
                    {(cert.skills ?? []).length > 0 && <div className="ksx-tags">{cert.skills.map((skill) => <span key={skill} className="ksx-tag">{skill}</span>)}</div>}
                    <div className="ksx-cert__actions">
                      <button type="button" onClick={() => handleDownload(cert)} className="ksl-btn ksl-btn--orange"><Download />Download</button>
                      <button type="button" onClick={() => setShareId(cert.id)} className="ksx-icon-btn" aria-label="Share certificate"><Share2 /></button>
                      <button type="button" onClick={() => window.open(verifyUrl(cert.id), '_blank', 'noopener,noreferrer')} className="ksx-icon-btn" aria-label="Verify certificate"><ExternalLink /></button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="ksx-empty" style={{ marginTop: '1rem' }}>
              <span className="ksx-empty__icon" style={{ background: '#e3edfb', color: '#f08a12' }}><Award /></span>
              <h3>{certificates.length ? 'No matching certificates' : 'No certificate has been issued yet'}</h3>
              <p>{certificates.length ? 'Try a different search or course.' : `You are eligible after ${ELIGIBLE_AT}% course completion. Your organization will review and issue the certificate once all requirements are approved.`}</p>
              <button type="button" onClick={() => navigate('/student/courses')} className="ksl-btn ksl-btn--orange"><BookOpen />Browse Courses<ArrowRight /></button>
            </div>
          )}
        </section>
      </div>

      {shareId && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShareId(null)} />
          <div className="ksl-card fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
            <div className="ksx-head"><h3 className="ksx-head__title">Share Certificate</h3><button type="button" className="ksx-icon-btn" onClick={() => setShareId(null)} aria-label="Close"><X /></button></div>
            <p className="ksx-muted-sm">Share your certificate with employers and your network.</p>
            <div className="ksx-head__main" style={{ marginTop: '0.9rem' }}>
              <label className="ksx-field" style={{ flex: 1 }}><ExternalLink aria-hidden="true" /><input readOnly value={verifyUrl(shareId)} aria-label="Certificate link" /></label>
              <button type="button" className="ksl-btn ksl-btn--orange" onClick={() => { navigator.clipboard?.writeText(verifyUrl(shareId)); toast.success('Link copied!'); setShareId(null) }}>Copy</button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
