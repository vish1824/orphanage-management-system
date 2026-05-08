import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";
import {
  LayoutDashboard,
  Users,
  Heart,
  Stethoscope,
  BookOpen,
  Home,
  HandHeart,
  DollarSign,
  Package,
  Calendar,
  BarChart3,
  ClipboardList,
  UserCog,
  LogOut,
  Menu,
  X,
  User,
  Images,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Children", path: "/children", icon: Users },
  { label: "Gallery", path: "/gallery", icon: Images },
  { label: "Staff", path: "/staff", icon: UserCog },
  { label: "Donations", path: "/donations", icon: Heart },
  { label: "Medical", path: "/medical", icon: Stethoscope },
  { label: "Education", path: "/education", icon: BookOpen },
  { label: "Adoptions", path: "/adoptions", icon: HandHeart },
  { label: "Expenses", path: "/expenses", icon: DollarSign },
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "Events", path: "/events", icon: Calendar },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Activity Logs", path: "/logs", icon: ClipboardList },
  { label: "Users", path: "/users", icon: User },
];

const staffNav = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Children", path: "/children", icon: Users },
  { label: "Gallery", path: "/gallery", icon: Images },
  { label: "Donations", path: "/donations", icon: Heart },
  { label: "Medical", path: "/medical", icon: Stethoscope },
  { label: "Education", path: "/education", icon: BookOpen },
  { label: "Adoptions", path: "/adoptions", icon: HandHeart },
  { label: "Expenses", path: "/expenses", icon: DollarSign },
  { label: "Inventory", path: "/inventory", icon: Package },
  { label: "Events", path: "/events", icon: Calendar },
  { label: "Activity Logs", path: "/logs", icon: ClipboardList },
];

const viewerNav = [
  { label: "Children Gallery", path: "/", icon: Images },
  { label: "Adoptions", path: "/adoptions", icon: HandHeart },
  { label: "Events", path: "/events", icon: Calendar },
];

const roleBadge = {
  admin: "bg-amber-100 text-amber-800",
  manager: "bg-teal-100 text-teal-800",
  staff: "bg-blue-100 text-blue-800",
  viewer: "bg-slate-100 text-slate-700",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { onlineUsers, connected } = useSocketContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const nav =
    user?.role === "viewer"
      ? viewerNav
      : ["admin", "manager"].includes(user?.role)
        ? adminNav
        : staffNav;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        className={`${open ? "w-64" : "w-16"} bg-navy-900 flex flex-col transition-all duration-300 shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <Home size={18} className="text-white" />
          </div>
          {open && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight font-display">
                Sunshine Home
              </p>
              <p className="text-slate-400 text-xs">Management System</p>
            </div>
          )}
        </div>

        {/* Online indicator */}
        {open && (
          <div
            className="mx-3 mt-3 px-3 py-2 rounded-xl"
            style={{
              background: connected
                ? "rgba(13,148,136,0.15)"
                : "rgba(100,116,139,0.15)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${connected ? "bg-teal-400 animate-pulse" : "bg-slate-500"}`}
              />
              <span
                className={`text-xs font-medium ${connected ? "text-teal-300" : "text-slate-400"}`}
              >
                {connected
                  ? `${onlineUsers.length} user${onlineUsers.length !== 1 ? "s" : ""} online`
                  : "Connecting..."}
              </span>
            </div>
            {connected && onlineUsers.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {onlineUsers.slice(0, 5).map((u, i) => (
                  <div
                    key={i}
                    title={u.name}
                    className="w-6 h-6 rounded-full bg-teal-500 border-2 border-navy-900 flex items-center justify-center text-white text-[10px] font-bold"
                  >
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                ))}
                {onlineUsers.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-white text-[10px]">
                    +{onlineUsers.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {nav.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                 ${
                   isActive
                     ? "bg-white/15 text-white"
                     : "text-slate-400 hover:text-white hover:bg-white/8"
                 }`
              }
              title={!open ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {open && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User block */}
        <div className="p-3 border-t border-white/10 shrink-0">
          {open ? (
            <div
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/8 cursor-pointer transition-colors"
              onClick={() => navigate("/profile")}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0 relative">
                {user?.name?.[0]?.toUpperCase()}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-teal-400 rounded-full border border-navy-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.name}
                </p>
                <span className={`badge text-[10px] ${roleBadge[user?.role]}`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded shrink-0"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/8 transition-all"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setOpen(!open)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />

          {/* Live badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
              connected
                ? "bg-teal-50 text-teal-700 border border-teal-100"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-teal-500 animate-pulse" : "bg-slate-400"}`}
            />
            {connected ? "Live" : "Offline"}
          </div>

          {/* Profile */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-navy-900 flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-700 leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
