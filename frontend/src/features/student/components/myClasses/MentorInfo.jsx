export default function MentorInfo({ name, avatar, role = 'Mentor' }) {
  const initials = String(name || role)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f55f7]/15 to-[#06b6a8]/15 ring-1 ring-[#0f55f7]/10">
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[10px] font-bold text-[#0f55f7]">{initials}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white">{name || 'TBA'}</p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">{role}</p>
      </div>
    </div>
  )
}
