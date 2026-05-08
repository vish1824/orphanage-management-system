import { useState, useEffect } from "react";
import { expensesAPI } from "../services/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import { SearchBar, EmptyState, ConfirmDialog } from "../components/SearchBar";
import toast from "react-hot-toast";
import { Wallet, Plus, Edit2, Trash2, TrendingDown, CheckCircle, Clock } from "lucide-react";

const CATEGORIES = ["Food & Nutrition", "Medical Supplies", "Education", "Utilities", "Maintenance", "Staff Salaries", "Recreation", "Transport", "Other"];
const EMPTY = { category: "", amount: "", expense_date: "", description: "", status: "Approved", approved_by: "" };

export default function Expenses() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await expensesAPI.getAll(); setRecords(data); }
    catch { toast.error("Failed to load expenses"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = records.filter(r => {
    const matchSearch = r.description?.toLowerCase().includes(search.toLowerCase()) || r.category?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterCat === "All" || r.category === filterCat);
  });

  const totalThisMonth = records.filter(r => {
    const d = new Date(r.expense_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, r) => s + parseFloat(r.amount || 0), 0);

  const totalThisYear = records.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const byCategory = CATEGORIES.map(cat => ({
    cat, total: records.filter(r => r.category === cat).reduce((s, r) => s + parseFloat(r.amount || 0), 0)
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = r => { setForm({ ...r, expense_date: r.expense_date?.split("T")[0] || "" }); setEditing(r.id); setShowModal(true); };

  const handleSave = async () => {
    if (!form.category || !form.amount || !form.expense_date)
      return toast.error("Category, amount and date are required");
    setSaving(true);
    try {
      if (editing) { await expensesAPI.update(editing, form); toast.success("Updated!"); }
      else { await expensesAPI.create(form); toast.success("Expense added!"); }
      setShowModal(false); load();
    } catch (e) { toast.error(e.response?.data?.error || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await expensesAPI.delete(deleteTarget.id); toast.success("Deleted"); setDeleteTarget(null); load(); }
    catch { toast.error("Delete failed"); }
  };

  const catColors = ["bg-blue-100 text-blue-700","bg-green-100 text-green-700","bg-purple-100 text-purple-700","bg-amber-100 text-amber-700","bg-rose-100 text-rose-700","bg-teal-100 text-teal-700"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">Expense Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage all expenditures</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Expense</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 bg-gradient-to-br from-rose-50 to-rose-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 rounded-lg flex items-center justify-center"><TrendingDown className="text-white" size={20} /></div>
            <div>
              <p className="text-xs text-rose-600 font-medium">This Month</p>
              <p className="text-xl font-bold text-rose-900">₹{totalThisMonth.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-navy-50 to-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center"><Wallet className="text-white" size={20} /></div>
            <div>
              <p className="text-xs text-slate-600 font-medium">This Year Total</p>
              <p className="text-xl font-bold text-navy-900">₹{totalThisYear.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-green-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center"><CheckCircle className="text-white" size={20} /></div>
            <div>
              <p className="text-xs text-teal-600 font-medium">Total Records</p>
              <p className="text-xl font-bold text-teal-900">{records.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-navy-900 mb-4">Expense by Category (This Year)</h3>
          <div className="flex flex-wrap gap-2">
            {byCategory.map((x, i) => (
              <div key={x.cat} className={`${catColors[i % catColors.length]} rounded-lg px-3 py-2 text-sm`}>
                <span className="font-medium">{x.cat}</span>
                <span className="ml-2 font-bold">₹{x.total.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search expenses..." />
          </div>
          <select className="input w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {loading ? <div className="text-center py-12 text-slate-400">Loading...</div> :
          filtered.length === 0 ? <EmptyState icon={Wallet} message="No expenses found" /> : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Category</th><th>Description</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td><span className="badge bg-slate-100 text-slate-700">{r.category}</span></td>
                    <td className="text-slate-600 max-w-xs truncate">{r.description}</td>
                    <td className="font-semibold text-rose-700">₹{parseFloat(r.amount).toLocaleString("en-IN")}</td>
                    <td className="text-slate-500">{r.expense_date?.split("T")[0]}</td>
                    <td><Badge status={r.status} color={r.status === "Approved" ? "green" : "yellow"} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Expense" : "Add Expense"} size="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">Select...</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Amount (₹) *</label>
            <input className="input" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
          </div>
          <div>
            <label className="label">Date *</label>
            <input className="input" type="date" value={form.expense_date} onChange={e => setForm({ ...form, expense_date: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {["Pending", "Approved", "Rejected"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the expense..." />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Approved By</label>
            <input className="input" value={form.approved_by} onChange={e => setForm({ ...form, approved_by: e.target.value })} placeholder="Name of approver" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Expense"}</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Expense" message={`Delete this ₹${deleteTarget?.amount} expense? This cannot be undone.`}
      />
    </div>
  );
}