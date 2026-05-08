import { Search } from 'lucide-react'

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        className="input pl-9 w-full"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-8 h-8 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon, message, title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
        {Icon && <Icon size={28} className="text-slate-400" />}
      </div>
      <div>
        <p className="font-semibold text-slate-700 text-lg">{message || title || 'No records found'}</p>
        {desc && <p className="text-sm text-slate-400 mt-1">{desc}</p>}
      </div>
    </div>
  )
}

export function ConfirmDialog({ isOpen, title, message, onConfirm, onClose, onCancel }) {
  const handleClose = onClose || onCancel || (() => {})
  if (isOpen === false) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-center w-14 h-14 bg-rose-50 rounded-2xl mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-bold text-center text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={handleClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchBar