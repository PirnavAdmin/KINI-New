// ================================================================
// WebinarsCalendarPage — Full-screen monthly calendar for webinars
// Route: /organization/webinars/calendar
// TODO: Replace with API integration when backend is ready
// ================================================================

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, Video, Users } from 'lucide-react'
import { ROUTES } from '@shared/constants/routeConstants'
import WebinarCalendar from '../components/WebinarCalendar'
import { getSummaryStats, getWebinarStatusStyle } from '../data/webinarMockData'
import { getAllWebinars } from '../utils/webinarHelpers'

export default function WebinarsCalendarPage() {
  const navigate = useNavigate()
  const today = new Date()
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())

  const allWebinars = getAllWebinars()
  const stats = getSummaryStats(allWebinars)

  const handlePrev = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }, [currentMonth])

  const handleNext = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }, [currentMonth])

  const handleToday = useCallback(() => {
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth())
  }, [])

  const handleDayClick = useCallback(
    (date) => {
      // Navigate back to list view filtered by this date
      navigate(ROUTES.ORG_ADMIN.WEBINARS)
    },
    [navigate]
  )

  return (
    <div className="w-full px-4 py-4 sm:px-5 lg:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.ORG_ADMIN.WEBINARS)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
              Webinars Calendar
            </h1>
            <p className="text-sm text-slate-400">View and manage webinars by month</p>
          </div>
        </div>
      </motion.div>

      {/* Summary strip */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: 'Total Events', value: stats.total, icon: Calendar, color: 'bg-blue-500' },
          { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'bg-purple-500' },
          { label: 'Live Now', value: stats.liveNow, icon: Video, color: 'bg-green-500' },
          { label: 'Total Attendees', value: stats.totalAttendees, icon: Users, color: 'bg-amber-500' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/50"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
            </div>
          )
        })}
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <WebinarCalendar
          currentYear={currentYear}
          currentMonth={currentMonth}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onDayClick={handleDayClick}
        />
      </motion.div>
    </div>
  )
}
