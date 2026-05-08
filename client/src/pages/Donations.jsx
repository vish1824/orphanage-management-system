import { useEffect, useState } from "react";
import { donationsAPI } from "../services/api";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import {
  SearchBar,
  LoadingSpinner,
  EmptyState,
  ConfirmDialog,
} from "../components/SearchBar";
import Badge from "../components/Badge";
import { Plus, Edit2, Trash2, Heart, TrendingUp } from "lucide-react";

const TYPES = ["Cash", "Goods", "Food", "Clothing", "Medicine", "Other"];
const EMPTY = {
  donor_name: "",
  donation_type: "Cash",
  amount: "",
  donation_date: "",
  status: "Completed",
  notes: "",
};

export default function Donations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    donationsAPI
      .getAll()
      .then((r) => setData(r.data))
      .catch(() => toast.error("Failed to load donations"))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.donor_name?.toLowerCase().includes(q) ||
      d.notes?.toLowerCase().includes(q);
    const matchType = typeFilter === "All" || d.donation_type === typeFilter;
    return matchSearch && matchType;
  });

  const totalCash = data
    .filter((d) => d.donation_type === "Cash")
    .reduce((s, d) => s + parseFloat(d.amount || 0), 0);
  const totalAll = data.reduce((s, d) => s + parseFloat(d.amount || 0), 0);

  const openAdd = () => {
    setForm(EMPTY);
    setEditing(null);
    setModal("form");
  };
  const openEdit = (d) => {
    setForm({ ...d, donation_date: d.donation_date?.split("T")[0] || "" });
    setEditing(d);
    setModal("form");
  };

  const handleSave = async () => {
    if (!form.donor_name || !form.donation_date) {
      toast.error("Donor name and date are required");
      return;
    }
    setSaving(true);
    try {
      if (editing?.id) {
        await donationsAPI.update(editing.id, form);
        toast.success("Updated!");
      } else {
        await donationsAPI.create(form);
        toast.success("Donation recorded!");
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
      await donationsAPI.delete(confirm.id);
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
            Donations
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {data.length} total donations recorded
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Add Donation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-green-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-teal-600 font-medium">
                Total Cash Received
              </p>
              <p className="text-xl font-bold text-teal-900">
                ₹{totalCash.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-amber-700 font-medium">
                All Donations Value
              </p>
              <p className="text-xl font-bold text-amber-900">
                ₹{totalAll.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-navy-50 to-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">
                Total Records
              </p>
              <p className="text-xl font-bold text-navy-900">{data.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by donor name or notes..."
            />
          </div>
          <select
            className="input w-auto"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Heart} message="No donations found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span className="font-semibold text-slate-800">
                        {d.donor_name}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-blue-50 text-blue-700 text-xs">
                        {d.donation_type}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-green-700">
                        ₹{parseFloat(d.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="text-slate-500">
                      {d.donation_date?.split("T")[0]}
                    </td>
                    <td>
                      <Badge status={d.status}>{d.status}</Badge>
                    </td>
                    <td className="text-slate-400 max-w-xs truncate text-xs">
                      {d.notes || "—"}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setConfirm(d)}
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
          title={editing?.id ? "Edit Donation" : "Record Donation"}
          onClose={() => setModal(null)}
          size="md"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Donor Name *</label>
              <input
                className="input"
                value={form.donor_name}
                onChange={(e) =>
                  setForm({ ...form, donor_name: e.target.value })
                }
                placeholder="Donor's full name or organisation"
              />
            </div>
            <div>
              <label className="label">Donation Type</label>
              <select
                className="input"
                value={form.donation_type}
                onChange={(e) =>
                  setForm({ ...form, donation_type: e.target.value })
                }
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input
                className="input"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Donation Date *</label>
              <input
                className="input"
                type="date"
                value={form.donation_date}
                onChange={(e) =>
                  setForm({ ...form, donation_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {["Completed", "Pending", "Cancelled"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Notes</label>
              <textarea
                className="input"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Purpose, remarks..."
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
              {saving ? "Saving..." : "Save Donation"}
            </button>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Donation"
        message={`Delete donation from "${confirm?.donor_name}"?`}
      />
    </div>
  );
}
