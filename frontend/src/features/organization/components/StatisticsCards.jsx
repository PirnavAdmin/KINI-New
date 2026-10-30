import KPI from '@/components/common/KPI'

const ACCENTS = ['blue', 'teal', 'green', 'orange']

export default function StatisticsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <KPI
          key={stat.label}
          value={stat.value}
          label={stat.label}
          description={stat.description}
          icon={stat.icon}
          accent={stat.accent ?? ACCENTS[index % ACCENTS.length]}
        />
      ))}
    </div>
  )
}
