import PropTypes from 'prop-types'
import { ArrowDownUp, BookOpen, ChevronDown, Layers3, Search } from 'lucide-react'
import { RECORDING_SORTS } from '@features/student/utils/recordings'

function SelectField({ Icon, label, value, onChange, options }) {
  return <label className="ksx-field ksx-rec-filters__select">
    <Icon aria-hidden="true" />
    <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
      {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
    </select>
    <ChevronDown aria-hidden="true" className="ksx-field__chevron" />
  </label>
}

SelectField.propTypes = {
  Icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
}

export default function RecordingFilters({ filters, onChange, courses, topics }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value })
  return <div className="ksl-card ksx-rec-filters" role="search">
    <label className="ksx-field ksx-rec-filters__search">
      <Search aria-hidden="true" />
      <input value={filters.search} onChange={(event) => set('search')(event.target.value)} placeholder="Search recordings..." aria-label="Search recordings" />
    </label>
    <SelectField Icon={BookOpen} label="Filter by course" value={filters.course} onChange={set('course')} options={[['all', 'All Courses'], ...courses.map((course) => [course, course])]} />
    <SelectField Icon={Layers3} label="Filter by topic" value={filters.topic} onChange={set('topic')} options={[['all', 'All Topics'], ...topics.map((topic) => [topic, topic])]} />
    <SelectField Icon={ArrowDownUp} label="Sort recordings" value={filters.sort} onChange={set('sort')} options={RECORDING_SORTS.map((sort) => [sort.id, sort.label])} />
  </div>
}

RecordingFilters.propTypes = {
  filters: PropTypes.shape({ search: PropTypes.string, course: PropTypes.string, topic: PropTypes.string, sort: PropTypes.string }).isRequired,
  onChange: PropTypes.func.isRequired,
  courses: PropTypes.arrayOf(PropTypes.string).isRequired,
  topics: PropTypes.arrayOf(PropTypes.string).isRequired,
}
