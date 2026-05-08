import { useState, useEffect } from "react";
import { logsAPI } from "../services/api";
import { SearchBar, EmptyState } from "../components/SearchBar";
import toast from "react-hot-toast";
import { Activity, User, Shield, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const actionColors = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-amber-100 text-amber-700",
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("All");
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try { const { data } = await logsAPI.getAll(); setLogs(data); }
      catch { toast.error("Failed to load logs"); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = logs.filter(l => {
    const matchSearch = l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase()) ||
      l.module?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === "All" || l.action === filterAction;
    return matchSearch && matchAction;
  });

  const isAdmin = ["admin", "manager"].includes(user?.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-display">Activity Logs</h1>
        <p className="text-slate-500 text-sm mt-1">
          {isAdmin ? "All user activity across the system" : "Your activity history"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {["CREATE","UPDATE","DELETE","LOGIN"].map(action => (
          <div key={action} className={`card p-4 cursor-pointer ${filterAction === action ? "ring-2 ring-navy-500" : ""}`} onClick={() => setFilterAction(filterAction === action ? "All" : action)}>
            <span className={`badge text-xs ${actionColors[action]}`}>{action}</span>
            <p className="text-2xl font-bold text-navy-900 mt-2">{logs.filter(l => l.action === action).length}</p>
            <p className="text-xs text-slate-500">{action.toLowerCase()}s logged</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by user, module or action..." />
          </div>
          <select className="input w-auto" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
            {["All","CREATE","UPDATE","DELETE","LOGIN"].map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        {loading ? <div className="text-center py-12 text-slate-400">Loading...</div> :
          filtered.length === 0 ? <EmptyState icon={Activity} message="No activity logs found" /> : (
          <div className="space-y-2">
            {filtered.map(l => (
              <div key={l.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 flex-shrink-0">
                  <User size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-navy-900 text-sm">{l.user_name || "System"}</span>
                    {isAdmin && l.user_role && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Shield size={10} /> {l.user_role}
                      </span>
                    )}
                    <span className={`badge text-xs ${actionColors[l.action] || "bg-slate-100 text-slate-600"}`}>{l.action}</span>
                    <span className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">{l.module}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5 truncate">{l.description}</p>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                  <Clock size={11} />
                  {new Date(l.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}