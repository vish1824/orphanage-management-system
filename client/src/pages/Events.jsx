import { useState, useEffect } from "react";
import { eventsAPI } from "../services/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import { SearchBar, EmptyState, ConfirmDialog } from "../components/SearchBar";
import toast from "react-hot-toast";
import { Calendar, Plus, Edit2, Trash2, Clock, CheckCircle, MapPin } from "lucide-react";

const EVENT_TYPES = ["Cultural", "Medical", "Educational", "Sports", "Fundraising", "Environmental", "Religious", "Other"];
const EMPTY = { title: "", event_type: "", start_date: "", end_date: "", description: "", status: "Upcoming", location: "" };

export default function Events() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await eventsAPI.getAll(); setRecords(data); }
    catch { toast.error("Failed to load events"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = records.filter(r => {
    const m = r.title?.toLowerCase().includes(search.toLowerCase()) || r.event_type?.toLowerCase().includes(search.toLowerCase());
    return m && (filterStatus === "All" || r.status === filterStatus);
  });

  const upcoming = records.filter(r => r.status === "Upcoming").length;
  const completed = records.filter(r => r.status === "Completed").length;
  const planned = records.filter(r => r.status === "Planned").length;

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = r => { setForm({ ...r, start_date: r.start_date?.split("T")[0] || "", end_date: r.end_date?.split("T")[0] || "" }); setEditing(r.id); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title || !form.start_date) return toast.error("Title and start date are required");
    setSaving(true);
    try {
      if (editing) { await eventsAPI.update(editing, form); toast.success("Updated!"); }
      else { await eventsAPI.create(form); toast.success("Event added!"); }
      setShowModal(false); load();
    } catch (e) { toast.error(e.response?.data?.error || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await eventsAPI.delete(deleteTarget.id); toast.success("Deleted"); setDeleteTarget(null); load(); }
    catch { toast.error("Delete failed"); }
  };

  const statusColor = { Upcoming: "blue", Completed: "green", Cancelled: "red", Planned: "yellow", Ongoing: "teal" };
  const typeColors = { Cultural: "bg-purple-100 text-purple-700", Medical: "bg-red-100 text-red-700", Educational: "bg-blue-100 text-blue-700", Sports: "bg-green-100 text-green-700", Fundraising: "bg-amber-100 text-amber-700", Environmental: "bg-teal-100 text-teal-700", Religious: "bg-rose-100 text-rose-700", Other: "bg-slate-100 text-slate-700" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">Events & Activities</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all orphanage events and programs</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Event</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: records.length, color: "bg-navy-50 text-navy-700" },
          { label: "Upcoming", value: upcoming, color: "bg-blue-50 text-blue-700" },
          { label: "Planned", value: planned, color: "bg-amber-50 text-amber-700" },
          { label: "Completed", value: completed, color: "bg-green-50 text-green-700" },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search events..." /></div>
          <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {["All", "Upcoming", "Planned", "Ongoing", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? <div className="text-center py-12 text-slate-400">Loading...</div> :
          filtered.length === 0 ? <EmptyState icon={Calendar} message="No events found" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(r => (
              <div key={r.id} className="border border-slate-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-navy-900">{r.title}</h3>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${typeColors[r.event_type] || "bg-slate-100 text-slate-700"}`}>
                      {r.event_type}
                    </span>
                  </div>
                  <Badge status={r.status} color={statusColor[r.status] || "slate"} />
                </div>
                {r.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{r.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock size={11} /> {r.start_date?.split("T")[0]}{r.end_date && r.end_date !== r.start_date ? ` → ${r.end_date?.split("T")[0]}` : ""}</span>
                  {r.location && <span className="flex items-center gap-1"><MapPin size={11} /> {r.location}</span>}
                </div>
                <div className="flex justify-end gap-1 mt-3 pt-3 border-t border-slate-100">
                  <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Event" : "Add Event"} size="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Event Title *</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event name" />
          </div>
          <div>
            <label className="label">Event Type</label>
            <select className="input" value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })}>
              <option value="">Select...</option>
              {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {["Upcoming", "Planned", "Ongoing", "Completed", "Cancelled"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Start Date *</label>
            <input className="input" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input className="input" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Venue or location" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Event details..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Event"}</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Event" message={`Delete "${deleteTarget?.title}"?`}
      />
    </div>
  );
}