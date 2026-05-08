import { useEffect, useState } from "react";
import { childrenAPI } from "../services/api";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import {
  SearchBar,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
} from "../components/SearchBar";
import Badge from "../components/Badge";
import { Plus, Edit2, Trash2, Eye, Users } from "lucide-react";

const EMPTY = {
  name: "",
  date_of_birth: "",
  gender: "Male",
  admission_type: "Orphan",
  status: "Active",
  hometown: "",
  medical_notes: "",
  guardian_name: "",
  guardian_contact: "",
};

function age(dob) {
  if (!dob) return "?";
  const d = new Date(dob),
    now = new Date();
  return (
    now.getFullYear() -
    d.getFullYear() -
    (now < new Date(now.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0)
  );
}

export default function Children() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'view'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    childrenAPI
      .getAll()
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load children"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.hometown?.toLowerCase().includes(q);
    const matchFilter = filter === "All" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const openAdd = () => {
    setForm(EMPTY);
    setEditing(null);
    setModal("add");
  };
  const openEdit = (c) => {
    setForm({ ...c, date_of_birth: c.date_of_birth?.split("T")[0] || "" });
    setEditing(c);
    setModal("edit");
  };
  const openView = (c) => {
    setEditing(c);
    setModal("view");
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (editing && modal === "edit") {
        await childrenAPI.update(editing.id, form);
        toast.success("Updated!");
      } else {
        await childrenAPI.create(form);
        toast.success("Child added!");
      }
      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await childrenAPI.delete(confirm.id);
      toast.success("Deleted");
      setConfirm(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const stats = {
    total: data.length,
    active: data.filter((c) => c.status === "Active").length,
    adopted: data.filter((c) => c.status === "Adopted").length,
    male: data.filter((c) => c.gender === "Male").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">
            Children Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {stats.active} active children in care
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Child
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Children",
            value: stats.total,
            color: "bg-navy-50 text-navy-700",
          },
          {
            label: "Active",
            value: stats.active,
            color: "bg-teal-50 text-teal-700",
          },
          {
            label: "Adopted",
            value: stats.adopted,
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Boys",
            value: stats.male,
            color: "bg-amber-50 text-amber-700",
          },
        ].map((s) => (
          <div key={s.label} className={`card p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by name or hometown..."
            />
          </div>
          <select
            className="input w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["All", "Active", "Adopted", "Transferred", "Deceased"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Users} message="No children found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Type</th>
                  <th>Hometown</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-sm">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td>{age(c.date_of_birth)} yrs</td>
                    <td>{c.gender}</td>
                    <td>
                      <span className="badge bg-slate-100 text-slate-600 text-xs">
                        {c.admission_type}
                      </span>
                    </td>
                    <td className="text-slate-500">{c.hometown || "—"}</td>
                    <td>
                      <Badge status={c.status}>{c.status}</Badge>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openView(c)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirm(c)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal
          title={modal === "add" ? "Add New Child" : "Edit Child Record"}
          onClose={() => setModal(null)}
          size="md"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Child's full name"
              />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input
                className="input"
                type="date"
                value={form.date_of_birth}
                onChange={(e) =>
                  setForm({ ...form, date_of_birth: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select
                className="input"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                {["Male", "Female", "Other"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Admission Type</label>
              <select
                className="input"
                value={form.admission_type}
                onChange={(e) =>
                  setForm({ ...form, admission_type: e.target.value })
                }
              >
                {["Orphan", "Half-Orphan", "Abandoned", "Surrendered"].map(
                  (t) => (
                    <option key={t}>{t}</option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {["Active", "Adopted", "Transferred", "Deceased"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Hometown</label>
              <input
                className="input"
                value={form.hometown}
                onChange={(e) => setForm({ ...form, hometown: e.target.value })}
                placeholder="City / District"
              />
            </div>
            <div>
              <label className="label">Guardian Name</label>
              <input
                className="input"
                value={form.guardian_name}
                onChange={(e) =>
                  setForm({ ...form, guardian_name: e.target.value })
                }
                placeholder="Guardian's name"
              />
            </div>
            <div>
              <label className="label">Guardian Contact</label>
              <input
                className="input"
                value={form.guardian_contact}
                onChange={(e) =>
                  setForm({ ...form, guardian_contact: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Medical Notes</label>
              <textarea
                className="input"
                rows={3}
                value={form.medical_notes}
                onChange={(e) =>
                  setForm({ ...form, medical_notes: e.target.value })
                }
                placeholder="Any medical conditions, allergies..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setModal(null)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving..." : "Save Child"}
            </button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modal === "view" && editing && (
        <Modal title="Child Details" onClose={() => setModal(null)} size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-navy-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-navy-200 flex items-center justify-center text-navy-800 text-2xl font-bold">
                {editing.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900">
                  {editing.name}
                </h3>
                <p className="text-slate-500 text-sm">
                  {age(editing.date_of_birth)} years old • {editing.gender}
                </p>
                <Badge status={editing.status}>{editing.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Date of Birth", editing.date_of_birth?.split("T")[0] || "—"],
                ["Admission Type", editing.admission_type],
                ["Hometown", editing.hometown || "—"],
                ["Guardian", editing.guardian_name || "—"],
                ["Guardian Contact", editing.guardian_contact || "—"],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">{k}</p>
                  <p className="font-medium text-slate-800">{v}</p>
                </div>
              ))}
            </div>
            {editing.medical_notes && (
              <div className="bg-rose-50 rounded-lg p-3">
                <p className="text-xs text-rose-600 font-medium mb-1">
                  Medical Notes
                </p>
                <p className="text-sm text-slate-700">
                  {editing.medical_notes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Child Record"
        message={`Permanently delete record for "${confirm?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
