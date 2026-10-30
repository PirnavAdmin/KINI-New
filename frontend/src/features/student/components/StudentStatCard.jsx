import PropTypes from 'prop-types'
import KPI from '@/components/common/KPI'

// Student-module stat card, rendered with the global KPI card so Student pages
// match every other portal. A text `aside` (e.g. a percentage chip) becomes the
// description line; a purely decorative aside is dropped.
// `valueFirst` and `valueColor` are accepted for compatibility.
const TONE = { violet: 'purple' }
const asideText = (aside) => {
  const text = aside?.props?.children
  return typeof text === 'string' || typeof text === 'number' ? text : undefined
}

// eslint-disable-next-line no-unused-vars
export default function StudentStatCard({ tone, Icon, label, value, aside, valueColor, valueFirst = false, onClick }) {
  return (
    <KPI
      label={label}
      value={value}
      description={asideText(aside)}
      icon={Icon}
      accent={TONE[tone] ?? tone}
      onClick={onClick}
    />
  )
}

StudentStatCard.propTypes = {
  tone: PropTypes.oneOf(['blue', 'green', 'orange', 'violet', 'red']).isRequired,
  Icon: PropTypes.elementType.isRequired,
  label: PropTypes.node.isRequired,
  value: PropTypes.node,
  aside: PropTypes.node,
  valueColor: PropTypes.string,
  valueFirst: PropTypes.bool,
  onClick: PropTypes.func,
}
