import { useState, useEffect } from "react";
import { adoptionsAPI, childrenAPI } from "../services/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import { SearchBar, EmptyState, ConfirmDialog } from "../components/SearchBar";
import toast from "react-hot-toast";
import { Heart, Plus, Edit2, Trash2, Eye, Phone, Mail, MapPin } from "lucide-react";

const EMPTY = {
  child_id: "", adoptive_parent_name: "", contact_number: "",
  email: "", address: "", application_date: "", status: "Pending", notes: "",
};

export default function Adoptions() {
  const [records, setRecords] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [a, c] = await Promise.all([adoptionsAPI.getAll(), childrenAPI.getAll()]);
      setRecords(a.data);
      setChildren(c.data);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = records.filter(r => {
    const matchSearch = r.child_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.adoptive_parent_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = (r) => { setForm({ ...r, application_date: r.application_date?.split("T")[0] || "" }); setEditing(r.id); setShowModal(true); };

  const handleSave = async () => {
    if (!form.child_id || !form.adoptive_parent_name || !form.contact_number)
      return toast.error("Child, parent name and contact are required");
    setSaving(true);
    try {
      if (editing) { await adoptionsAPI.update(editing, form); toast.success("Updated!"); }
      else { await adoptionsAPI.create(form); toast.success("Application added!"); }
      setShowModal(false); load();
    } catch (e) { toast.error(e.response?.data?.error || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await adoptionsAPI.delete(deleteTarget.id);
      toast.success("Deleted"); setDeleteTarget(null); load();
    } catch { toast.error("Delete failed"); }
  };

  const statusColors = { Pending: "yellow", Approved: "green", Rejected: "red", Completed: "blue" };
  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === "Pending").length,
    approved: records.filter(r => r.status === "Approved").length,
    completed: records.filter(r => r.status === "Completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">Adoption Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track adoption applications and status</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Application
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: stats.total, color: "bg-blue-50 text-blue-700" },
          { label: "Pending Review", value: stats.pending, color: "bg-amber-50 text-amber-700" },
          { label: "Approved", value: stats.approved, color: "bg-green-50 text-green-700" },
          { label: "Completed", value: stats.completed, color: "bg-teal-50 text-teal-700" },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by child or parent name..." />
          </div>
          <select className="input w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {["All", "Pending", "Approved", "Rejected", "Completed"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Heart} message="No adoption applications found" />
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">
                      {r.child_name?.[0] || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900">{r.child_name || "Unknown Child"}</h3>
                      <p className="text-sm text-slate-600">Applicant: <span className="font-medium">{r.adoptive_parent_name}</span></p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Phone size={11} />{r.contact_number}</span>
                        {r.email && <span className="flex items-center gap-1"><Mail size={11} />{r.email}</span>}
                        {r.address && <span className="flex items-center gap-1"><MapPin size={11} />{r.address}</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Applied: {r.application_date?.split("T")[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={r.status} color={statusColors[r.status]} />
                    <button onClick={() => setViewItem(r)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Eye size={15} /></button>
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Edit2 size={15} /></button>
                    <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>
                {r.notes && <p className="mt-2 text-xs text-slate-500 bg-slate-50 rounded p-2">{r.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Application" : "New Adoption Application"} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Child *</label>
            <select className="input" value={form.child_id} onChange={e => setForm({ ...form, child_id: e.target.value })}>
              <option value="">Select child...</option>
              {children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Adoptive Parent Name *</label>
            <input className="input" value={form.adoptive_parent_name} onChange={e => setForm({ ...form, adoptive_parent_name: e.target.value })} placeholder="Full name" />
          </div>
          <div>
            <label className="label">Contact Number *</label>
            <input className="input" value={form.contact_number} onChange={e => setForm({ ...form, contact_number: e.target.value })} placeholder="Phone number" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
          </div>
          <div>
            <label className="label">Application Date</label>
            <input className="input" type="date" value={form.application_date} onChange={e => setForm({ ...form, application_date: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {["Pending", "Approved", "Rejected", "Completed"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Address / City</label>
            <input className="input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, State" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Application"}</button>
        </div>
      </Modal>

      {/* View Modal */}
      {viewItem && (
        <Modal isOpen={!!viewItem} onClose={() => setViewItem(null)} title="Adoption Details" size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-rose-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 text-2xl font-bold">{viewItem.child_name?.[0]}</div>
              <div>
                <h3 className="text-lg font-bold text-navy-900">{viewItem.child_name}</h3>
                <Badge status={viewItem.status} color={statusColors[viewItem.status]} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Parent Name", viewItem.adoptive_parent_name],
                ["Contact", viewItem.contact_number],
                ["Email", viewItem.email || "N/A"],
                ["Address", viewItem.address || "N/A"],
                ["Applied On", viewItem.application_date?.split("T")[0]],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs">{k}</p>
                  <p className="font-medium text-slate-800">{v}</p>
                </div>
              ))}
            </div>
            {viewItem.notes && <div className="bg-amber-50 rounded-lg p-3"><p className="text-xs text-amber-600 font-medium mb-1">Notes</p><p className="text-sm text-slate-700">{viewItem.notes}</p></div>}
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Application"
        message={`Delete adoption application for ${deleteTarget?.child_name}? This cannot be undone.`}
      />
    </div>
  );
}