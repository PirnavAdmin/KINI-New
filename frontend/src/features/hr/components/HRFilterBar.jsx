import { RotateCcw, Save } from 'lucide-react'
import { Select } from '@shared/components/FormElements'
import Button from '@shared/components/Button'

/**
 * HRFilterBar — advanced filter row (department / designation / status / branch /
 * role / date / shift / type…). Each filter: { key, label, value, onChange, options }.
 * Renders the shared Select component and optional Reset + Save buttons.
 */
export default function HRFilterBar({ filters = [], onReset, onSave, className = '' }) {
  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`}>
      {filters.map((filter) => (
        <div key={filter.key} className="min-w-[150px] flex-[1_1_150px]">
          <Select
            label={filter.label}
            value={filter.value}
            onChange={filter.onChange}
            options={filter.options}
          />
        </div>
      ))}
      {(onReset || onSave) && (
        <div className="flex shrink-0 items-center gap-2 pb-0.5">
          {onReset && (
            <Button variant="ghost" size="sm" icon={RotateCcw} onClick={onReset}>
              Reset
            </Button>
          )}
          {onSave && (
            <Button variant="secondary" size="sm" icon={Save} onClick={onSave}>
              Save Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
