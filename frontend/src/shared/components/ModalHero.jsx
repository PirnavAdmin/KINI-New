import { X } from 'lucide-react'
import './modal-hero.css'

/**
 * ModalHero — illustrated header for create/add dialogs (Add Student,
 * Add Employee, Add Batch, Add Attendance, Create Assessment).
 *
 *   icon      lucide component shown in the white tile on the left
 *   eyebrow   optional small uppercase line above the title
 *   title     plain text part of the heading ("Add")
 *   accent    highlighted word(s) of the heading ("Employee")
 *   accentTone "orange" (default) | "blue"
 *   subtitle  one-line description
 *   art       image URL, anchored bottom-right (transparent artwork)
 *   onClose   renders the round close button when provided
 *   closeDisabled disables the close button (e.g. while saving)
 *   children  rendered under the copy, e.g. a stepper
 */
export default function ModalHero({
  icon: Icon,
  eyebrow,
  title,
  accent,
  accentTone = 'orange',
  subtitle,
  art,
  onClose,
  closeDisabled = false,
  titleId,
  children,
  className = '',
}) {
  return (
    <header className={`kmh ${children ? 'kmh--with-steps' : ''} ${className}`.trim()}>
      <svg className="kmh__bg" viewBox="0 0 1200 240" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 190 C220 150 420 230 680 196 C900 168 1050 214 1200 182 V240 H0 Z" fill="#ffffff" fillOpacity=".55" />
        <ellipse cx="930" cy="40" rx="360" ry="150" fill="#ffffff" fillOpacity=".4" />
      </svg>
      <span className="kmh__dots" aria-hidden="true" />
      {art && <img className="kmh__art" src={art} alt="" aria-hidden="true" draggable={false} decoding="async" />}
      <div className="kmh__main">
        {Icon && <span className="kmh__icon" aria-hidden="true"><Icon /></span>}
        <div className="kmh__copy">
          {eyebrow && <p className="kmh__eyebrow">{eyebrow}</p>}
          <h2 id={titleId} className="kmh__title">
            {title}{accent && <> <em className={`is-${accentTone}`}>{accent}</em></>}
          </h2>
          {subtitle && <p className="kmh__subtitle">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="kmh__extra">{children}</div>}
      {onClose && (
        <button type="button" className="kmh__close" aria-label="Close" disabled={closeDisabled} onClick={onClose}>
          <X aria-hidden="true" />
        </button>
      )}
    </header>
  )
}
