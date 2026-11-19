import { useId } from 'react'
import { BriefcaseBusiness, CalendarDays, Mail, UserRound, X } from 'lucide-react'
import Modal from '@shared/components/Modal'
import { hrField } from '../services/hrApi'
import LeaveAttachments from './LeaveAttachments'
import './hr-leave-details.css'

const EMPTY = '—'

const text = value => (value == null || String(value).trim() === '' ? null : String(value).trim())

const dateOnly = value => {
  const raw = text(value)
  if (!raw) return null
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const date = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(raw)
  return Number.isNaN(date.getTime()) ? raw : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

// Server timestamps are UTC without a zone marker; show them in local time.
const dateTime = value => {
  const raw = text(value)
  if (!raw) return null
  const date = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : `${raw}Z`)
  return Number.isNaN(date.getTime()) ? raw : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date)
}

const typeTone = type => {
  const value = String(type || '').toLowerCase()
  if (value.includes('sick') || value.includes('medical')) return 'red'
  if (value.includes('casual')) return 'blue'
  if (value.includes('earned') || value.includes('annual') || value.includes('privilege')) return 'green'
  return 'slate'
}

const statusTone = status => {
  const value = String(status || '').toLowerCase()
  if (value.includes('approve')) return 'green'
  if (value.includes('reject')) return 'red'
  if (value.includes('cancel')) return 'slate'
  return 'amber'
}

function Row({ label, children }) {
  const empty = children == null || children === ''
  return <div className="hld__row">
    <dt>{label}</dt>
    <dd className={empty ? 'is-empty' : undefined}>{empty ? EMPTY : children}</dd>
  </div>
}

function Card({ icon: Icon, title, children }) {
  return <section className="hld__card" aria-label={title}>
    <header className="hld__card-head"><span className="hld__card-icon" aria-hidden="true"><Icon /></span><h3>{title}</h3></header>
    <dl className="hld__rows">{children}</dl>
  </section>
}

/** HR "Leave Details" dialog: employee + status cards and the supporting documents. */
export default function HrLeaveDetails({ value, leaveId, onClose }) {
  const titleId = useId()
  const field = (...keys) => hrField(value, ...keys)

  const leaveType = text(field('leaveType', 'type'))
  const status = text(field('status'))
  const email = text(field('email', 'employeeEmail'))
  const approved = String(status || '').toLowerCase().includes('approve')
  const rejected = String(status || '').toLowerCase().includes('reject')
  const days = field('days', 'totalDays')

  const hero = <header className="hld__hero">
    <svg className="hld__swoosh" viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M330 80 C420 70 470 10 600 0 L600 80 Z" fill="#eef2f8" />
      <path d="M300 80 C400 66 440 8 560 0 L600 0 C470 10 420 70 330 80 Z" fill="#f39924" />
    </svg>
    <span className="hld__hero-icon" aria-hidden="true"><CalendarDays /></span>
    <h2 id={titleId} className="hld__title">Leave Details</h2>
    <button type="button" className="hld__close" aria-label="Close leave details" onClick={onClose}><X aria-hidden="true" /></button>
  </header>

  return <Modal open size="lg" motionPreset="rise" trapFocus ariaLabelledBy={titleId} hero={hero} onClose={onClose} className="hld" bodyClassName="hld__body">
    <div className="hld__grid">
      <Card icon={UserRound} title="Employee Information">
        <Row label="Leave ID">{text(field('leaveId', 'leaveRequestId', 'id')) ?? text(leaveId)}</Row>
        <Row label="Employee Name">{text(field('employeeName', 'name'))}</Row>
        <Row label="Employee ID">{text(field('employeeId', 'employeeCode'))}</Row>
        <Row label="Email">{email && <a className="hld__mail" href={`mailto:${email}`}><Mail aria-hidden="true" />{email}</a>}</Row>
        <Row label="Leave Type">{leaveType && <span className={`hld__pill is-${typeTone(leaveType)}`}>{leaveType}</span>}</Row>
        <Row label="Reason">{text(field('reason'))}</Row>
      </Card>
      <Card icon={BriefcaseBusiness} title="Leave Status & Approval">
        <Row label="Status">{status && <span className={`hld__pill is-${statusTone(status)} is-caps`}>{status}</span>}</Row>
        <Row label="From Date">{dateOnly(field('fromDate', 'startDate'))}</Row>
        <Row label="To Date">{dateOnly(field('toDate', 'endDate'))}</Row>
        <Row label="Days">{days == null ? null : `${days} ${Number(days) === 1 ? 'day' : 'days'}`}</Row>
        <Row label="Applied On">{dateTime(field('appliedOn', 'createdAt'))}</Row>
        <Row label={rejected ? 'Rejected By' : 'Approved By'}>{approved || rejected ? text(field('approvedByName', 'approvedBy')) : null}</Row>
        <Row label={rejected ? 'Rejected On' : 'Approved On'}>{approved || rejected ? dateTime(field('approvedOn')) : null}</Row>
        {rejected && <Row label="Rejection Reason">{text(field('rejectionReason'))}</Row>}
      </Card>
    </div>
    <LeaveAttachments value={value} />
  </Modal>
}
