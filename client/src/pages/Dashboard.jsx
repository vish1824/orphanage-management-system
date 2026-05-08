import { useEffect, useState, useCallback } from "react";
import { dashAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";
import { LoadingSpinner } from "../components/SearchBar";
import {
  Users,
  UserCheck,
  HeartHandshake,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#0f2744",
  "#0d9488",
  "#d97706",
  "#e11d48",
  "#7c3aed",
  "#2563eb",
];

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtRs = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function Dashboard() {
  const { user } = useAuth();
  const { socket, connected } = useSocketContext();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [s, c, a] = await Promise.all([
        dashAPI.getStats(),
        dashAPI.getCharts(),
        dashAPI.getRecentActivity(),
      ]);
      setStats(s.data);
      setCharts(c.data);
      setActivity(a.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ⚡ REAL-TIME: refresh stats whenever any data changes
  useEffect(() => {
    if (!socket) return;
    const handler = (event) => {
      console.log("Real-time event:", event);
      // Silently refresh dashboard stats when any data changes
      loadAll(true);
    };
    socket.on("data:changed", handler);
    return () => socket.off("data:changed", handler);
  }, [socket, loadAll]);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const s = stats || {};

  const actionIcon = {
    CREATE: <CheckCircle size={14} className="text-teal-500" />,
    UPDATE: <Clock size={14} className="text-amber-500" />,
    DELETE: <AlertTriangle size={14} className="text-rose-500" />,
    LOGIN: <UserCheck size={14} className="text-blue-500" />,
  };

  const kpiCards = [
    {
      title: "Active Children",
      value: fmt(s.activeChildren),
      icon: Users,
      color: "navy",
      sub: `${fmt(s.adoptedChildren || 0)} adopted`,
    },
    {
      title: "Staff Members",
      value: fmt(s.activeStaff),
      icon: Briefcase,
      color: "teal",
      sub: "Currently active",
    },
    {
      title: "Pending Adoptions",
      value: fmt(s.pendingAdoptions),
      icon: HeartHandshake,
      color: "amber",
      sub: `${fmt(s.adoptedChildren || 0)} completed`,
    },
    {
      title: "Yearly Donations",
      value: fmtRs(s.yearlyDonations),
      icon: TrendingUp,
      color: "navy",
      sub: "This year",
    },
    {
      title: "This Month Spend",
      value: fmtRs(s.monthlyExpenses),
      icon: TrendingDown,
      color: "rose",
      sub: "Monthly expenses",
    },
  ];

  const donationLine = (charts?.donationTrend || []).map((d) => ({
    month: d.month,
    donations: Number(d.total || 0),
  }));
  const expenseBar = (charts?.expenseByCategory || []).map((d) => ({
    type: d.category,
    value: Number(d.total || 0),
  }));
  const genderPie = (charts?.childrenByGender || []).map((d) => ({
    status: d.gender,
    count: Number(d.count || 0),
  }));
  const admissionData = (charts?.admissionType || []).map((d) => ({
    status: d.admission_type,
    count: Number(d.count || 0),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sunshine Children's Home — Live Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Last updated */}
          {lastUpdated && (
            <p className="text-xs text-slate-400 hidden sm:block">
              Updated{" "}
              {lastUpdated.toLocaleTimeString("en-IN", { timeStyle: "short" })}
            </p>
          )}
          {/* Manual refresh */}
          <button
            onClick={() => loadAll(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          {/* Live indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
              connected ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-600"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${connected ? "bg-teal-500 animate-pulse" : "bg-red-400"}`}
            />
            {connected ? "Live" : "Offline"}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map(({ title, value, icon: Icon, color, sub }) => (
          <div
            key={title}
            className={`card p-5 border-l-4 ${
              color === "navy"
                ? "border-navy-900"
                : color === "teal"
                  ? "border-teal-500"
                  : color === "amber"
                    ? "border-amber-500"
                    : "border-rose-500"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                color === "navy"
                  ? "bg-navy-50 text-navy-700"
                  : color === "teal"
                    ? "bg-teal-50 text-teal-600"
                    : color === "amber"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-rose-50 text-rose-500"
              }`}
            >
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-navy-900">{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {title}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Upcoming Events",
            value: fmt(s.upcomingEvents),
            color: "bg-violet-50 text-violet-700",
            icon: Calendar,
          },
          {
            label: "Low Stock Items",
            value: fmt(s.lowStockItems),
            color: "bg-rose-50 text-rose-700",
            icon: Package,
          },
          {
            label: "Total Donations",
            value: fmtRs(s.yearlyDonations),
            color: "bg-green-50 text-green-700",
            icon: TrendingUp,
          },
          {
            label: "Adopted Children",
            value: fmt(s.adoptedChildren),
            color: "bg-teal-50 text-teal-700",
            icon: HeartHandshake,
          },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className={`${color} rounded-xl p-2.5 shrink-0`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">{label}</p>
              <p className="text-xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-navy-900 mb-4">
            📈 Donation Trends
          </h3>
          {donationLine.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              No donation data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={donationLine}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) => [
                    `₹${Number(v).toLocaleString("en-IN")}`,
                    "Donations",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="donations"
                  stroke="#0f2744"
                  strokeWidth={2.5}
                  dot={{ fill: "#0f2744", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold text-navy-900 mb-4">
            👦👧 By Gender
          </h3>
          {genderPie.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              No data
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={genderPie}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={35}
                  >
                    {genderPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {genderPie.map((d, i) => (
                  <div
                    key={d.status}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-slate-600">{d.status}</span>
                    </div>
                    <span className="font-bold text-slate-800">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Bar */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-navy-900 mb-4">
            💰 Expenses by Category
          </h3>
          {expenseBar.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={expenseBar} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="type"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  width={90}
                />
                <Tooltip
                  formatter={(v) => [
                    `₹${Number(v).toLocaleString("en-IN")}`,
                    "Amount",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="value" fill="#0f2744" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-navy-900">
              ⚡ Live Activity
            </h3>
            {connected && (
              <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Real-time
              </div>
            )}
          </div>
          {activity.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              No activity yet
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-[240px]">
              {activity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    {actionIcon[a.action] || (
                      <Clock size={14} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {a.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <span className="font-medium text-slate-600">
                        {a.user_name || "System"}
                      </span>
                      {" · "}
                      {new Date(a.created_at).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                    {a.module}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admission Type breakdown */}
      {admissionData.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-bold text-navy-900 mb-4">
            📋 Children by Admission Type
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {admissionData.map((d, i) => (
              <div
                key={d.status}
                className="text-center p-4 rounded-xl"
                style={{
                  background: `${COLORS[i % COLORS.length]}18`,
                  border: `1px solid ${COLORS[i % COLORS.length]}30`,
                }}
              >
                <p
                  className="text-3xl font-bold"
                  style={{ color: COLORS[i % COLORS.length] }}
                >
                  {d.count}
                </p>
                <p className="text-sm font-medium text-slate-600 mt-1">
                  {d.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
