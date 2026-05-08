import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed. Check credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (e, pw) => {
    setEmail(e);
    setPassword(pw);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left — Branding Panel */}
        <div className="hidden md:flex w-2/5 bg-navy-900 flex-col justify-between p-10 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight">
                  Sunshine Home
                </p>
                <p className="text-slate-400 text-xs">Management System</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white leading-snug mb-4">
              Caring for every
              <br />
              <span className="text-amber-400">child</span>, every day.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              A complete system to manage children's welfare, staff, donations,
              medical records and more.
            </p>
          </div>

          {/* Stats */}
          <div className="relative z-10 grid grid-cols-3 gap-3 mt-8">
            {[
              ["150+", "Children"],
              ["12", "Staff"],
              ["₹8L+", "Donations"],
            ].map(([v, l]) => (
              <div key={l} className="bg-white/8 rounded-xl p-3 text-center">
                <p className="text-amber-400 font-bold text-lg">{v}</p>
                <p className="text-slate-400 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10">
          {/* Mobile logo */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-navy-900">Sunshine Home</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sunshinehome.org"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all text-sm"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-10 border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            New here?{" "}
            <Link
              to="/register"
              className="text-navy-700 font-semibold hover:underline"
            >
              Create an account
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Demo Accounts
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                {
                  role: "Admin",
                  email: "admin@sunshinehome.org",
                  pw: "admin123",
                  color: "bg-red-50 text-red-700",
                },
                {
                  role: "Manager",
                  email: "priya@sunshinehome.org",
                  pw: "manager123",
                  color: "bg-blue-50 text-blue-700",
                },
                {
                  role: "Staff",
                  email: "anitha@sunshinehome.org",
                  pw: "staff123",
                  color: "bg-teal-50 text-teal-700",
                },
                {
                  role: "Viewer",
                  email: "viewer@sunshinehome.org",
                  pw: "viewer123",
                  color: "bg-slate-100 text-slate-600",
                },
              ].map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => fillDemo(d.email, d.pw)}
                  className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.color}`}
                  >
                    {d.role}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {d.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-3">
            Click any demo account to fill credentials, then click Sign In
          </p>
        </div>
      </div>
    </div>
  );
}
