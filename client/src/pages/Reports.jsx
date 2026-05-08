import { useState, useEffect } from "react";
import { dashAPI, childrenAPI, donationsAPI, expensesAPI } from "../services/api";
import toast from "react-hot-toast";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FileText, Users, Heart, Wallet, TrendingUp, Download } from "lucide-react";

const COLORS = ["#0f2744","#d97706","#0d9488","#dc2626","#7c3aed","#0284c7","#65a30d"];

export default function Reports() {
  const [charts, setCharts] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s] = await Promise.all([dashAPI.getCharts(), dashAPI.getStats()]);
        setCharts(c.data);
        setStats(s.data);
      } catch { toast.error("Failed to load reports"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "children", label: "Children", icon: Users },
    { id: "financial", label: "Financial", icon: Wallet },
    { id: "trends", label: "Trends", icon: TrendingUp },
  ];

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400 text-lg">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Insights and data visualizations</p>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? "bg-white text-navy-900 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Active Children", value: stats.activeChildren, icon: Users, color: "text-blue-600 bg-blue-50" },
              { label: "Active Staff", value: stats.activeStaff, icon: Heart, color: "text-teal-600 bg-teal-50" },
              { label: "Yearly Donations", value: `₹${(stats.yearlyDonations/1000).toFixed(0)}K`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
              { label: "Pending Adoptions", value: stats.pendingAdoptions, icon: FileText, color: "text-amber-600 bg-amber-50" },
            ].map(s => (
              <div key={s.label} className="card p-5">
                <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon size={20} />
                </div>
                <p className="text-2xl font-bold text-navy-900">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {charts?.expenseByCategory && (
            <div className="card p-6">
              <h3 className="font-semibold text-navy-900 mb-4">Expense Breakdown by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={charts.expenseByCategory} margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Amount"]} />
                  <Bar dataKey="total" fill="#0f2744" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Children Tab */}
      {activeTab === "children" && charts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Children by Gender</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={charts.childrenByGender} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={90} label={({ gender, percent }) => `${gender} ${(percent*100).toFixed(0)}%`}>
                  {charts.childrenByGender.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Admission Type Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={charts.admissionType} dataKey="count" nameKey="admission_type" cx="50%" cy="50%" outerRadius={90} label={({ admission_type, percent }) => `${admission_type} ${(percent*100).toFixed(0)}%`}>
                  {charts.admissionType.map((_, i) => <Cell key={i} fill={COLORS[i+2]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === "financial" && charts && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Monthly Donation Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.donationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Donations"]} />
                <Line type="monotone" dataKey="total" stroke="#d97706" strokeWidth={3} dot={{ fill: "#d97706" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-navy-900 mb-4">Monthly Expense Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts.expenseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString("en-IN")}`, "Expenses"]} />
                <Line type="monotone" dataKey="total" stroke="#dc2626" strokeWidth={3} dot={{ fill: "#dc2626" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && charts && (
        <div className="card p-6">
          <h3 className="font-semibold text-navy-900 mb-4">Donations vs Expenses (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={charts.donationTrend.map((d, i) => ({
              month: d.month,
              Donations: d.total,
              Expenses: charts.expenseTrend[i]?.total || 0,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={v => `₹${v.toLocaleString("en-IN")}`} />
              <Legend />
              <Bar dataKey="Donations" fill="#d97706" radius={[4,4,0,0]} />
              <Bar dataKey="Expenses" fill="#dc2626" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}