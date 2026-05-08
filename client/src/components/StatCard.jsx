// src/components/StatCard.jsx
export default function StatCard({ title, value, icon: Icon, color, sub }) {
  const colors = {
    navy:  { bg: 'bg-navy-900',  text: 'text-white', sub: 'text-navy-200', icon: 'bg-white/10' },
    teal:  { bg: 'bg-teal-600',  text: 'text-white', sub: 'text-teal-100', icon: 'bg-white/20' },
    amber: { bg: 'bg-amber-500', text: 'text-white', sub: 'text-amber-100',icon: 'bg-white/20' },
    rose:  { bg: 'bg-rose-600',  text: 'text-white', sub: 'text-rose-100', icon: 'bg-white/20' },
    slate: { bg: 'bg-white', text: 'text-slate-800', sub: 'text-slate-500', icon: 'bg-slate-100' },
  }
  const c = colors[color] || colors.slate
  return (
    <div className={`${c.bg} rounded-2xl p-5 shadow-card`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${color && color !== 'slate' ? 'text-white/60' : 'text-slate-500'}`}>{title}</p>
          <p className={`text-3xl font-display font-bold mt-1 ${c.text}`}>{value}</p>
          {sub && <p className={`text-xs mt-1 ${c.sub}`}>{sub}</p>}
        </div>
        {Icon && (
          <div className={`${c.icon} rounded-xl p-2.5`}>
            <Icon size={20} className={c.text} />
          </div>
        )}
      </div>
    </div>
  )
}