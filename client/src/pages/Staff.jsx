import { useEffect, useState } from "react";
import { staffAPI } from "../services/api";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import {
  SearchBar,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
} from "../components/SearchBar";
import Badge from "../components/Badge";
import { Plus, Edit2, Trash2, Eye, UserCog } from "lucide-react";

const DEPARTMENTS = [
  "Administration",
  "Medical",
  "Education",
  "Welfare",
  "Kitchen",
  "Security",
  "Transport",
  "Maintenance",
];
const EMPTY = {
  name: "",
  position: "",
  department: "",
  email: "",
  phone: "",
  join_date: "",
  status: "Active",
  salary: "",
  address: "",
};

export default function Staff() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    staffAPI
      .getAll()
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load staff"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.position?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q);
    const matchDept = dept === "All" || s.department === dept;
    return matchSearch && matchDept;
  });

  const openAdd = () => {
    setForm(EMPTY);
    setEditing(null);
    setModal("form");
  };
  const openEdit = (s) => {
    setForm({ ...s, join_date: s.join_date?.split("T")[0] || "" });
    setEditing(s);
    setModal("form");
  };
  const openView = (s) => {
    setEditing(s);
    setModal("view");
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (editing && modal === "form" && editing.id) {
        await staffAPI.update(editing.id, form);
        toast.success("Updated!");
      } else {
        await staffAPI.create(form);
        toast.success("Staff added!");
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
      await staffAPI.delete(confirm.id);
      toast.success("Deleted");
      setConfirm(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const deptColors = {
    Medical: "bg-rose-50 text-rose-700",
    Education: "bg-blue-50 text-blue-700",
    Administration: "bg-navy-50 text-navy-700",
    Welfare: "bg-teal-50 text-teal-700",
    Kitchen: "bg-amber-50 text-amber-700",
    Security: "bg-slate-100 text-slate-700",
    Transport: "bg-purple-50 text-purple-700",
    Maintenance: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">
            Staff Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {data.filter((s) => s.status === "Active").length} active staff
            members
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Staff",
            value: data.length,
            color: "bg-navy-50 text-navy-700",
          },
          {
            label: "Active",
            value: data.filter((s) => s.status === "Active").length,
            color: "bg-teal-50 text-teal-700",
          },
          {
            label: "On Leave",
            value: data.filter((s) => s.status === "On Leave").length,
            color: "bg-amber-50 text-amber-700",
          },
          {
            label: "Departments",
            value: new Set(data.map((s) => s.department)).size,
            color: "bg-blue-50 text-blue-700",
          },
        ].map((s) => (
          <div key={s.label} className={`card p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by name, position, email..."
            />
          </div>
          <select
            className="input w-auto"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={UserCog} message="No staff found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 font-bold text-sm">
                          {s.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {s.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium">{s.position || "—"}</td>
                    <td>
                      <span
                        className={`badge text-xs ${deptColors[s.department] || "bg-slate-100 text-slate-600"}`}
                      >
                        {s.department || "—"}
                      </span>
                    </td>
                    <td className="text-slate-500">{s.phone || "—"}</td>
                    <td className="font-medium text-slate-700">
                      {s.salary
                        ? `₹${Number(s.salary).toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                    <td>
                      <Badge status={s.status}>{s.status}</Badge>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openView(s)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirm(s)}
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

      {modal === "form" && (
        <Modal
          title={editing?.id ? "Edit Staff" : "Add Staff Member"}
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
                placeholder="Staff full name"
              />
            </div>
            <div>
              <label className="label">Position / Role</label>
              <input
                className="input"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                placeholder="e.g. Doctor, Teacher"
              />
            </div>
            <div>
              <label className="label">Department</label>
              <select
                className="input"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              >
                <option value="">Select...</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="label">Join Date</label>
              <input
                className="input"
                type="date"
                value={form.join_date}
                onChange={(e) =>
                  setForm({ ...form, join_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Salary (₹)</label>
              <input
                className="input"
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="Monthly salary"
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {["Active", "Inactive", "On Leave"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <textarea
                className="input"
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Home address"
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
              {saving ? "Saving..." : "Save Staff"}
            </button>
          </div>
        </Modal>
      )}

      {modal === "view" && editing && (
        <Modal title="Staff Details" onClose={() => setModal(null)} size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-teal-200 flex items-center justify-center text-teal-800 text-2xl font-bold">
                {editing.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900">
                  {editing.name}
                </h3>
                <p className="text-slate-500 text-sm">
                  {editing.position} • {editing.department}
                </p>
                <Badge status={editing.status}>{editing.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Email", editing.email || "—"],
                ["Phone", editing.phone || "—"],
                ["Join Date", editing.join_date?.split("T")[0] || "—"],
                [
                  "Salary",
                  editing.salary
                    ? `₹${Number(editing.salary).toLocaleString("en-IN")}`
                    : "—",
                ],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">{k}</p>
                  <p className="font-medium text-slate-800">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Staff Record"
        message={`Delete record for "${confirm?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
