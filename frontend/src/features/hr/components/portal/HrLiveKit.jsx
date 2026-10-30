import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Info, MoreVertical, Search, XCircle } from 'lucide-react'
import { AvatarPhoto } from '@/components/common/ProfileImage'
import { useProfilePhoto } from '@shared/hooks/useProfilePhoto'
import { CHART_COLORS, initials, statusTone } from './hrLiveUtils'
import './hr-live.css'

/* ──────────────────────────────────────────────────────────────────────
   v23 — design kit for the live HR modules (HrApiModule): filter card,
   data table (checkbox, avatars, pills, coloured actions, ⋮ menu,
   numbered pager) and small SVG charts for the bottom insight panels.
   ────────────────────────────────────────────────────────────────────── */

const AVATAR_TONES = ['#6d5dfc', '#22a06b', '#2f6fe4', '#f97316', '#e5484d', '#0ea5e9', '#a855f7', '#14b8a6']
const toneFor = (name) => AVATAR_TONES[[...String(name ?? '')].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % AVATAR_TONES.length]

// A photo URL already on the row (photoUrl) is used as-is. Otherwise, with
// profileType/profileId the avatar looks the photo up (rows rendered together
// share one batch request); initials when there is none.
export function Avatar({ name, size = 30, profileType, profileId, photoUrl: embeddedPhoto = '' }) {
  const { photoUrl: fetchedPhoto } = useProfilePhoto(profileType, profileId, { enabled: !embeddedPhoto })
  return <span className="hrl-avatar overflow-hidden" style={{ '--hrl-av': toneFor(name), width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true"><AvatarPhoto src={embeddedPhoto || fetchedPhoto} fallback={initials(name)} /></span>
}

export function PersonCell({ name, sub, onClick, profileClickable = false, profileType, profileId, photoUrl, avatarSize }) {
  const label = <span className="hrl-person__text"><b title={typeof name === 'string' ? name : undefined}>{name}</b>{sub && <small>{sub}</small>}</span>
  const avatar = <Avatar name={name} size={avatarSize} profileType={profileType} profileId={profileId} photoUrl={photoUrl} />
  if (onClick && profileClickable) return <button type="button" className="hrl-person hrl-link" onClick={onClick}>{avatar}{label}</button>
  return (
    <span className="hrl-person">
      {avatar}
      {onClick ? <button type="button" className="hrl-link" onClick={onClick}>{label}</button> : label}
    </span>
  )
}

const ROLE_TONES = { hr: 'blue', hrexecutive: 'blue', mentor: 'purple', trainer: 'purple', employee: 'green', admin: 'orange' }
export function RolePill({ value }) {
  if (value == null || value === '') return <span className="hrl-muted">Not supplied</span>
  const tone = ROLE_TONES[String(value).replace(/[\s_-]/g, '').toLowerCase()] ?? 'slate'
  return <span className={`hrl-pill is-${tone}`}>{String(value)}</span>
}
export function TagPill({ value, tone = 'blue' }) {
  if (value == null || value === '') return <span className="hrl-muted">Not supplied</span>
  return <span className={`hrl-pill is-${tone} is-soft`}>{String(value)}</span>
}


/** variant: "dot" (• Active), "caps" (• ACTIVE), "icon" (✓ Active), "box" (uppercase badge). */
export function StatusPill({ value, variant = 'dot' }) {
  if (value == null || value === '') return <span className="hrl-muted">—</span>
  const tone = statusTone(value)
  const Icon = tone === 'green' ? CheckCircle2 : tone === 'red' ? XCircle : Clock3
  return (
    <span className={`hrl-status is-${tone} is-${variant}`}>
      {(variant === 'dot' || variant === 'caps') && <i aria-hidden="true" />}
      {variant === 'icon' && <Icon aria-hidden="true" />}
      {variant === 'box' || variant === 'caps' ? String(value).toUpperCase() : String(value)}
    </span>
  )
}


/* ── Row menu ─────────────────────────────────────────────────────── */
export function RowMenu({ items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const close = (event) => { if (!ref.current?.contains(event.target)) setOpen(false) }
    const key = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', key) }
  }, [open])
  if (!items.length) return <span className="hrl-menu-spacer" />
  return (
    <span className="hrl-menu" ref={ref}>
      <button type="button" className="hrl-kebab" aria-label="More actions" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}><MoreVertical /></button>
      {open && (
        <span className="hrl-menu__list" role="menu">
          {items.map((item) => (
            <button key={item.label} type="button" role="menuitem" disabled={item.disabled} className={item.danger ? 'is-danger' : ''} onClick={() => { setOpen(false); item.onClick() }}>
              {item.icon && <item.icon aria-hidden="true" />}{item.label}
            </button>
          ))}
        </span>
      )}
    </span>
  )
}

/** tone: "plain" | "blue" | "red" | "green" | "orange" */
export function ActionButton({ tone = 'plain', icon: Icon, children, ...rest }) {
  return <button type="button" className={`hrl-act is-${tone}`} {...rest}>{Icon && <Icon aria-hidden="true" />}{children}</button>
}

/* ── Filter card ──────────────────────────────────────────────────── */
export function FilterCard({ title, icon: TitleIcon, children, search, onReset, onSearch, extra }) {
  return (
    <section className="hrl-filters" aria-label="Filters">
      {title && <h2 className="hrl-filters__title">{TitleIcon && <TitleIcon aria-hidden="true" />}{title}</h2>}
      <div className="hrl-filters__row">
        {search && (
          <label className="hrl-search">
            <span className="sr-only">Search</span>
            <Search aria-hidden="true" />
            <input type="search" aria-label="Search" placeholder={search.placeholder} value={search.value} onChange={(event) => search.onChange(event.target.value)} />
          </label>
        )}
        {children}
        <span className="hrl-filters__buttons">
          {onReset && <button type="button" className="hrl-btn is-ghost" onClick={onReset}>Reset</button>}
          {onSearch && <button type="button" className="hrl-btn is-primary" onClick={onSearch}><Search aria-hidden="true" />Search</button>}
        </span>
      </div>
      {extra && <div className="hrl-filters__row hrl-filters__row--extra">{extra}</div>}
    </section>
  )
}

export function FilterField({ label, children }) {
  return <label className="hrl-field"><span>{label}</span>{children}</label>
}

/* ── Tabs ─────────────────────────────────────────────────────────── */
export function StatusTabs({ tabs, value, onChange }) {
  return (
    <div className="hrl-tabs" role="tablist">
      {tabs.map((tab) => (
        <button key={tab.value || 'all'} type="button" role="tab" aria-selected={value === tab.value} className={value === tab.value ? 'is-active' : ''} onClick={() => onChange(tab.value)}>
          {tab.label}{tab.count != null && <> ({tab.count})</>}
        </button>
      ))}
    </div>
  )
}

/* ── Table ────────────────────────────────────────────────────────── */
const HEAD_TONES = ['purple', 'purple', 'blue', 'orange', 'green', 'teal', 'lavender', 'purple']

/**
 * columns: [{ key, header, render(row), tone, width }]
 * rowKey(row) → id. actions(row) → ReactNode. selection: Set + onSelect(newSet).
 */
export function LiveTable({ columns, rows, rowKey, loading, actions, selected, onSelect, empty, footer }) {
  const keys = rows.map(rowKey)
  const allChecked = keys.length > 0 && keys.every((key) => selected?.has(key))
  const toggleAll = () => onSelect(allChecked ? new Set() : new Set(keys))
  const toggle = (key) => { const next = new Set(selected); if (next.has(key)) next.delete(key); else next.add(key); onSelect(next) }
  return (
    <section className="hrl-table-card">
      <div className="hrl-table-wrap">
        <table className="hrl-table" data-table-header="plain">
          {(loading || rows.length > 0) && <thead>
            <tr>
              {onSelect && <th className="hrl-check"><input type="checkbox" aria-label="Select all rows" checked={allChecked} onChange={toggleAll} disabled={!rows.length} /></th>}
              {columns.map((column, index) => <th key={column.key} style={column.width ? { width: column.width } : undefined}><span className={`hrl-th is-${column.tone ?? HEAD_TONES[index % HEAD_TONES.length]}`}>{column.header}</span></th>)}
              {actions && <th><span className="hrl-th is-lavender">Actions</span></th>}
            </tr>
          </thead>}
          <tbody>
            {loading && Array.from({ length: 5 }, (_, index) => (
              <tr key={`s${index}`} className="hrl-skeleton"><td colSpan={columns.length + (onSelect ? 1 : 0) + (actions ? 1 : 0)}><span /></td></tr>
            ))}
            {!loading && rows.map((row, index) => {
              const key = keys[index]
              return (
                <tr key={key ?? index} className={selected?.has(key) ? 'is-selected' : ''}>
                  {onSelect && <td className="hrl-check"><input type="checkbox" aria-label="Select row" checked={selected.has(key)} onChange={() => toggle(key)} /></td>}
                  {columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}
                  {actions && <td className="hrl-actions-cell"><span className="hrl-actions">{actions(row)}</span></td>}
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && !rows.length && empty}
      </div>
      {footer}
    </section>
  )
}

export function EmptyState({ title, description, action, icon = 'box' }) {
  return (
    <div className="hrl-empty">
      <svg viewBox="0 0 160 110" aria-hidden="true" className="hrl-empty__art">
        {icon === 'megaphone' ? (
          <g>
            <rect x="34" y="18" width="62" height="78" rx="8" fill="#e8effb" stroke="#c9d8f0" strokeWidth="2" transform="rotate(-10 65 57)" />
            <rect x="48" y="22" width="62" height="78" rx="8" fill="#fff" stroke="#c9d8f0" strokeWidth="2" />
            {[38, 50, 62].map((y) => <rect key={y} x="58" y={y} width="40" height="5" rx="2.5" fill="#dbe6f7" />)}
            <path d="M92 66 L124 50 V92 L92 78 Z" fill="#2f6fe4" /><rect x="84" y="64" width="12" height="16" rx="3" fill="#1d4f91" />
            <path d="M130 52 l10 -8 M132 70 h12 M130 86 l10 8" stroke="#f39924" strokeWidth="4" strokeLinecap="round" />
            <path d="M24 60 l10 4 -10 4 Z M18 36 l4 6 -6 2 Z" fill="#f7b731" />
          </g>
        ) : (
          <g>
            <rect x="40" y="22" width="70" height="56" rx="8" fill="#e8effb" stroke="#c9d8f0" strokeWidth="2" transform="rotate(-8 75 50)" />
            <rect x="50" y="26" width="70" height="56" rx="8" fill="#fff" stroke="#c9d8f0" strokeWidth="2" />
            <path d="M85 40 l5 10 11 1 -8 7 3 11 -11 -6 -10 6 3 -11 -8 -7 11 -1 Z" fill="#2f6fe4" />
            <circle cx="112" cy="70" r="14" fill="none" stroke="#1d4f91" strokeWidth="5" /><path d="M122 80 L134 94" stroke="#1d4f91" strokeWidth="6" strokeLinecap="round" />
            <path d="M30 70 l3 -8 3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 Z M138 30 l2 -5 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 Z" fill="#f39924" />
          </g>
        )}
      </svg>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

/** Numbered pager with "Showing a–b of n label". */
export function Pager({ page, totalPages, totalCount, pageSize = 10, shown, label = 'records', onPage, disabled }) {
  const pages = Math.max(1, totalPages ?? page)
  const from = shown ? (page - 1) * pageSize + 1 : 0
  const to = (page - 1) * pageSize + shown
  const list = []
  for (let index = Math.max(1, page - 2); index <= Math.min(pages, Math.max(1, page - 2) + 4); index++) list.push(index)
  const nextDisabled = disabled || (totalPages != null ? page >= totalPages : shown < pageSize)
  return (
    <div className="hrl-pager">
      <span>Showing {from}–{to}{totalCount != null ? ` of ${totalCount}` : ''} {label}</span>
      <span className="hrl-pager__pages">
        <button type="button" aria-label="Previous page" disabled={disabled || page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft /></button>
        {list.map((number) => <button key={number} type="button" aria-current={number === page ? 'page' : undefined} className={number === page ? 'is-current' : ''} disabled={disabled} onClick={() => onPage(number)}>{number}</button>)}
        <button type="button" aria-label="Next page" disabled={nextDisabled} onClick={() => onPage(page + 1)}><ChevronRight /></button>
      </span>
    </div>
  )
}

/* ── Insight panels & charts ──────────────────────────────────────── */
export function Panel({ title, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`hrl-panel ${className}`}>
      <header className="hrl-panel__head">
        {Icon && <span className="hrl-panel__icon" aria-hidden="true"><Icon /></span>}
        <h2>{title}</h2>
        {action && <span className="hrl-panel__action">{action}</span>}
      </header>
      {children}
    </section>
  )
}
export function PanelEmpty({ icon: Icon, title = 'No data available', text }) {
  return <div className="hrl-panel-empty">{Icon && <span aria-hidden="true"><Icon /></span>}<b>{title}</b>{text && <p>{text}</p>}</div>
}
export function PanelNote({ title, children }) {
  return <p className="hrl-note"><Info aria-hidden="true" /><span>{title && <b>{title}</b>}{children}</span></p>
}


export function Donut({ data, centerValue, centerLabel, colors = CHART_COLORS, size = 150 }) {
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  let offset = 0
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} className="hrl-donut" role="img" aria-label={`${centerLabel}: ${centerValue}`}>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#e8eef7" strokeWidth="20" />
      {total > 0 && data.map((item, index) => {
        const length = (Math.max(0, item.value) / total) * circumference
        const node = <circle key={item.label} cx="70" cy="70" r={radius} fill="none" stroke={colors[index % colors.length]} strokeWidth="20" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" />
        offset += length
        return node
      })}
      <text x="70" y="70" textAnchor="middle" className="hrl-donut__value">{centerValue}</text>
      <text x="70" y="88" textAnchor="middle" className="hrl-donut__label">{centerLabel}</text>
    </svg>
  )
}

export function Legend({ data, colors = CHART_COLORS, total, percent = true }) {
  const sum = total ?? data.reduce((value, item) => value + item.value, 0)
  return (
    <ul className="hrl-legend">
      {data.map((item, index) => (
        <li key={item.label}>
          <i style={{ background: colors[index % colors.length] }} aria-hidden="true" />
          <span>{item.label}</span>
          <b>{item.value}</b>
          {percent && <em>{sum ? `${((item.value / sum) * 100).toFixed(1)}%` : '0%'}</em>}
        </li>
      ))}
    </ul>
  )
}

/** Horizontal bar list: label, value chip on the bar, percent. */
export function BarList({ data, colors = CHART_COLORS, total }) {
  const sum = total ?? data.reduce((value, item) => value + item.value, 0)
  return (
    <ul className="hrl-bars">
      {data.map((item, index) => {
        const pct = sum ? (item.value / sum) * 100 : 0
        return (
          <li key={item.label}>
            <span className="hrl-bars__label">{item.label}</span>
            <span className="hrl-bars__count">{item.value}</span>
            <span className="hrl-bars__track"><span style={{ width: `${Math.max(pct, item.value ? 4 : 0)}%`, background: colors[index % colors.length] }}>{item.value > 0 && item.value}</span></span>
            <em>{pct.toFixed(1)}%</em>
          </li>
        )
      })}
    </ul>
  )
}

/** Multi-series line chart. series: [{ label, color, values: number[] }], labels: string[] */
export function LineChart({ labels, series, height = 200 }) {
  const width = 520
  const pad = { l: 28, r: 12, t: 12, b: 26 }
  const max = Math.max(2, ...series.flatMap((item) => item.values))
  const step = Math.ceil(max / 4)
  const top = step * 4
  const x = (index) => pad.l + (labels.length <= 1 ? 0 : (index / (labels.length - 1)) * (width - pad.l - pad.r))
  const y = (value) => pad.t + (1 - value / top) * (height - pad.t - pad.b)
  return (
    <div className="hrl-line">
      <ul className="hrl-line__legend">{series.map((item) => <li key={item.label}><i style={{ background: item.color }} />{item.label}</li>)}</ul>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend chart">
        {[0, 1, 2, 3, 4].map((tick) => <g key={tick}><line x1={pad.l} x2={width - pad.r} y1={y(tick * step)} y2={y(tick * step)} stroke="#edf2f8" /><text x={pad.l - 8} y={y(tick * step) + 4} textAnchor="end" className="hrl-line__tick">{tick * step}</text></g>)}
        {labels.map((label, index) => <text key={label + index} x={x(index)} y={height - 6} textAnchor="middle" className="hrl-line__tick">{label}</text>)}
        {series.map((item, sIndex) => {
          const points = item.values.map((value, index) => `${x(index)},${y(value)}`).join(' ')
          return (
            <g key={item.label}>
              {sIndex === 0 && item.values.length > 1 && <polygon points={`${x(0)},${y(0)} ${points} ${x(item.values.length - 1)},${y(0)}`} fill={item.color} fillOpacity=".12" />}
              <polyline points={points} fill="none" stroke={item.color} strokeWidth="2" />
              {item.values.map((value, index) => <circle key={index} cx={x(index)} cy={y(value)} r="3" fill="#fff" stroke={item.color} strokeWidth="2" />)}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

Avatar.propTypes = { name: PropTypes.string, size: PropTypes.number }
PersonCell.propTypes = { name: PropTypes.string, sub: PropTypes.node, onClick: PropTypes.func, profileClickable: PropTypes.bool }
RowMenu.propTypes = { items: PropTypes.array.isRequired }
LiveTable.propTypes = { columns: PropTypes.array.isRequired, rows: PropTypes.array.isRequired, rowKey: PropTypes.func.isRequired }
