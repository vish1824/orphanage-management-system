// src/components/Badge.jsx
export const statusColors = {
  Active:       'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  Adopted:      'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  Transferred:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Deceased:     'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  Applied:      'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  'Under Review':'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Approved:     'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  Completed:    'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  Rejected:     'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  admin:        'bg-navy-100 text-navy-900 ring-1 ring-navy-200',
  manager:      'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  staff:        'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  'LOW STOCK':  'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  OK:           'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
}

export default function Badge({ children, status }) {
  const cls = statusColors[status || children] || 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
  return <span className={`badge ${cls}`}>{children}</span>
}