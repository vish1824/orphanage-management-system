import { useEffect, useState } from "react";
import { educationAPI, childrenAPI } from "../services/api";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import {
  SearchBar,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
} from "../components/SearchBar";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";

const GRADES = [
  "LKG",
  "UKG",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
];
const EMPTY = {
  child_id: "",
  academic_year: "2024-2025",
  grade: "",
  school_name: "Good Morning School",
  percentage: "",
  grade_letter: "",
  remarks: "",
};

const gradeColor = (g) => {
  if (!g) return "bg-slate-100 text-slate-600";
  if (["A+", "A"].includes(g)) return "bg-green-100 text-green-700";
  if (["B+", "B"].includes(g)) return "bg-blue-100 text-blue-700";
  if (["C+", "C"].includes(g)) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

export default function Education() {
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
    Promise.all([educationAPI.getAll(), childrenAPI.getAll()])
      .then(([e, c]) => {
        setData(e.data);
        setChildren(c.data);
      })
      .catch(() => toast.error("Failed to load"))
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
      r.school_name?.toLowerCase().includes(q) ||
      r.grade?.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setForm(EMPTY);
    setEditing(null);
    setModal("form");
  };
  const openEdit = (r) => {
    setForm({ ...r });
    setEditing(r);
    setModal("form");
  };

  const handleSave = async () => {
    if (!form.child_id || !form.grade) {
      toast.error("Child and grade required");
      return;
    }
    setSaving(true);
    try {
      if (editing?.id) {
        await educationAPI.update(editing.id, form);
        toast.success("Updated!");
      } else {
        await educationAPI.create(form);
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
      await educationAPI.delete(confirm.id);
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
            Education Records
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {data.length} academic records
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
            placeholder="Search by child name, grade or school..."
          />
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={BookOpen} message="No education records found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Year</th>
                  <th>Grade</th>
                  <th>School</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Remarks</th>
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
                    <td className="text-slate-500">{r.academic_year}</td>
                    <td>{r.grade}</td>
                    <td className="text-slate-500 text-sm">
                      {r.school_name || "—"}
                    </td>
                    <td>
                      <span className="font-bold text-navy-900">
                        {r.percentage ? `${r.percentage}%` : "—"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge text-xs ${gradeColor(r.grade_letter)}`}
                      >
                        {r.grade_letter || "—"}
                      </span>
                    </td>
                    <td className="text-slate-400 text-sm max-w-xs truncate">
                      {r.remarks || "—"}
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
          title={editing?.id ? "Edit Education Record" : "Add Education Record"}
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
              <label className="label">Academic Year</label>
              <input
                className="input"
                value={form.academic_year}
                onChange={(e) =>
                  setForm({ ...form, academic_year: e.target.value })
                }
                placeholder="2024-2025"
              />
            </div>
            <div>
              <label className="label">Grade/Class *</label>
              <select
                className="input"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              >
                <option value="">Select...</option>
                {GRADES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">School Name</label>
              <input
                className="input"
                value={form.school_name}
                onChange={(e) =>
                  setForm({ ...form, school_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Percentage (%)</label>
              <input
                className="input"
                type="number"
                min="0"
                max="100"
                value={form.percentage}
                onChange={(e) =>
                  setForm({ ...form, percentage: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Grade Letter</label>
              <select
                className="input"
                value={form.grade_letter}
                onChange={(e) =>
                  setForm({ ...form, grade_letter: e.target.value })
                }
              >
                <option value="">Select...</option>
                {["A+", "A", "B+", "B", "C+", "C", "D", "F"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Remarks</label>
              <textarea
                className="input"
                rows={2}
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Teacher's remarks..."
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
        message="Delete this education record?"
      />
    </div>
  );
}
