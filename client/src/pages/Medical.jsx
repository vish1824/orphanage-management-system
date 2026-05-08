import { useEffect, useState } from "react";
import { medicalAPI, childrenAPI } from "../services/api";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import {
  SearchBar,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
} from "../components/SearchBar";
import { Plus, Edit2, Trash2, Stethoscope } from "lucide-react";

const TYPES = [
  "Routine Checkup",
  "Vaccination",
  "Treatment",
  "Surgery",
  "Dental",
  "Eye Test",
  "Asthma Review",
  "Other",
];
const EMPTY = {
  child_id: "",
  record_type: "Routine Checkup",
  record_date: "",
  diagnosis: "",
  treatment: "",
  doctor_name: "",
  next_appointment: "",
};

export default function Medical() {
  const [data, setData] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([medicalAPI.getAll(), childrenAPI.getAll()])
      .then(([m, c]) => {
        setData(m.data);
        setChildren(c.data);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.child_name?.toLowerCase().includes(q) ||
      r.doctor_name?.toLowerCase().includes(q) ||
      r.diagnosis?.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setForm(EMPTY);
    setEditing(null);
    setModal("form");
  };
  const openEdit = (r) => {
    setForm({
      ...r,
      record_date: r.record_date?.split("T")[0] || "",
      next_appointment: r.next_appointment?.split("T")[0] || "",
    });
    setEditing(r);
    setModal("form");
  };

  const handleSave = async () => {
    if (!form.child_id || !form.record_date) {
      toast.error("Child and date are required");
      return;
    }
    setSaving(true);
    try {
      if (editing?.id) {
        await medicalAPI.update(editing.id, form);
        toast.success("Updated!");
      } else {
        await medicalAPI.create(form);
        toast.success("Record added!");
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
      await medicalAPI.delete(confirm.id);
      toast.success("Deleted");
      setConfirm(null);
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">
            Medical Records
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {data.length} medical records
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Record
        </button>
      </div>

      <div className="card p-6">
        <div className="mb-6">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by child, doctor or diagnosis..."
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Stethoscope} message="No medical records found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Diagnosis</th>
                  <th>Doctor</th>
                  <th>Next Appointment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="font-semibold text-slate-800">
                        {r.child_name || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-rose-50 text-rose-700 text-xs">
                        {r.record_type}
                      </span>
                    </td>
                    <td className="text-slate-500">
                      {r.record_date?.split("T")[0]}
                    </td>
                    <td className="text-slate-600 max-w-xs truncate">
                      {r.diagnosis || "—"}
                    </td>
                    <td className="text-slate-500">{r.doctor_name || "—"}</td>
                    <td className="text-slate-400 text-sm">
                      {r.next_appointment?.split("T")[0] || "—"}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirm(r)}
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
          title={editing?.id ? "Edit Medical Record" : "Add Medical Record"}
          onClose={() => setModal(null)}
          size="md"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Child *</label>
              <select
                className="input"
                value={form.child_id}
                onChange={(e) => setForm({ ...form, child_id: e.target.value })}
              >
                <option value="">Select child...</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Record Type</label>
              <select
                className="input"
                value={form.record_type}
                onChange={(e) =>
                  setForm({ ...form, record_type: e.target.value })
                }
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Record Date *</label>
              <input
                className="input"
                type="date"
                value={form.record_date}
                onChange={(e) =>
                  setForm({ ...form, record_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Doctor Name</label>
              <input
                className="input"
                value={form.doctor_name}
                onChange={(e) =>
                  setForm({ ...form, doctor_name: e.target.value })
                }
                placeholder="Doctor's name"
              />
            </div>
            <div>
              <label className="label">Next Appointment</label>
              <input
                className="input"
                type="date"
                value={form.next_appointment}
                onChange={(e) =>
                  setForm({ ...form, next_appointment: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Diagnosis</label>
              <textarea
                className="input"
                rows={2}
                value={form.diagnosis}
                onChange={(e) =>
                  setForm({ ...form, diagnosis: e.target.value })
                }
                placeholder="Diagnosis details..."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Treatment / Prescription</label>
              <textarea
                className="input"
                rows={2}
                value={form.treatment}
                onChange={(e) =>
                  setForm({ ...form, treatment: e.target.value })
                }
                placeholder="Treatment given, medicines prescribed..."
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
              {saving ? "Saving..." : "Save Record"}
            </button>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Record"
        message="Delete this medical record? This cannot be undone."
      />
    </div>
  );
}
