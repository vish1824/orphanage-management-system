// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Home, Eye, EyeOff, UserPlus } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'', role:'staff', phone:'' })
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Fill all required fields'); return }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await authAPI.register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone })
      toast.success('Account created! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-11 h-11 bg-navy-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Home size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-navy-900 text-xl">Sunshine Home</p>
            <p className="text-slate-500 text-xs">Create your account</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-2xl font-display font-bold text-navy-900 mb-1">Create Account</h2>
          <p className="text-slate-500 text-sm mb-6">Register to access the management system.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-row">
              <div>
                <label className="label">Full Name *</label>
                <input className="input" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" placeholder="9XXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input className="input" type="email" placeholder="you@sunshinehome.org" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div>
              <label className="label">Role</label>
              <select className="select" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">Admin accounts must be promoted by an existing admin.</p>
            </div>

            <div className="form-row">
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input className="input pr-10" type={show ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShow(!show)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input className="input" type={show ? 'text' : 'password'} placeholder="Repeat password" value={form.confirm} onChange={e => set('confirm', e.target.value)} />
              </div>
            </div>

            <button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><UserPlus size={18}/> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-navy-700 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}