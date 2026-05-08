import { useState, useEffect } from "react";
import { inventoryAPI } from "../services/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import { SearchBar, EmptyState, ConfirmDialog } from "../components/SearchBar";
import toast from "react-hot-toast";
import { Package, Plus, Edit2, Trash2, AlertTriangle, CheckCircle, Archive } from "lucide-react";

const CATEGORIES = ["Food", "Medicine", "Stationery", "Clothing", "Bedding", "Hygiene", "Cleaning", "Equipment", "Other"];
const UNITS = ["kg", "Litre", "pieces", "boxes", "rolls", "bottles", "bars", "sets", "tablets", "packets"];
const EMPTY = { item_name: "", category: "", quantity: "", unit: "", minimum_quantity: "", expiry_date: "", supplier: "", notes: "" };

export default function Inventory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStock, setFilterStock] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await inventoryAPI.getAll(); setRecords(data); }
    catch { toast.error("Failed to load inventory"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const isLow = r => parseInt(r.quantity) <= parseInt(r.minimum_quantity);
  const isExpiring = r => {
    if (!r.expiry_date) return false;
    const exp = new Date(r.expiry_date);
    const soon = new Date(); soon.setDate(soon.getDate() + 30);
    return exp < soon;
  };

  const filtered = records.filter(r => {
    const matchSearch = r.item_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || r.category === filterCat;
    const matchStock = filterStock === "All" || (filterStock === "Low" && isLow(r)) || (filterStock === "OK" && !isLow(r));
    return matchSearch && matchCat && matchStock;
  });

  const lowCount = records.filter(isLow).length;
  const expiringCount = records.filter(isExpiring).length;

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit = r => { setForm({ ...r, expiry_date: r.expiry_date?.split("T")[0] || "" }); setEditing(r.id); setShowModal(true); };

  const handleSave = async () => {
    if (!form.item_name || !form.category || form.quantity === "")
      return toast.error("Item name, category and quantity are required");
    setSaving(true);
    try {
      if (editing) { await inventoryAPI.update(editing, form); toast.success("Updated!"); }
      else { await inventoryAPI.create(form); toast.success("Item added!"); }
      setShowModal(false); load();
    } catch (e) { toast.error(e.response?.data?.error || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await inventoryAPI.delete(deleteTarget.id); toast.success("Deleted"); setDeleteTarget(null); load(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">Inventory Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track supplies and stock levels</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Item</button>
      </div>

      {/* Alert banners */}
      {lowCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
          <p className="text-amber-800 font-medium text-sm">
            <span className="font-bold">{lowCount} items</span> are below minimum stock level and need restocking.
          </p>
        </div>
      )}
      {expiringCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-800 font-medium text-sm">
            <span className="font-bold">{expiringCount} items</span> are expiring within the next 30 days.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: records.length, icon: Archive, color: "bg-blue-50 text-blue-700" },
          { label: "Low Stock", value: lowCount, icon: AlertTriangle, color: lowCount > 0 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700" },
          { label: "Expiring Soon", value: expiringCount, icon: AlertTriangle, color: expiringCount > 0 ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700" },
          { label: "OK Stock", value: records.length - lowCount, icon: CheckCircle, color: "bg-teal-50 text-teal-700" },
        ].map(s => (
          <div key={s.label} className={`card p-4 ${s.color}`}>
            <s.icon size={20} className="mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search items..." /></div>
          <select className="input w-auto" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="input w-auto" value={filterStock} onChange={e => setFilterStock(e.target.value)}>
            <option value="All">All Stock Levels</option>
            <option value="Low">Low Stock Only</option>
            <option value="OK">Adequate Stock</option>
          </select>
        </div>

        {loading ? <div className="text-center py-12 text-slate-400">Loading...</div> :
          filtered.length === 0 ? <EmptyState icon={Package} message="No inventory items found" /> : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr><th>Item</th><th>Category</th><th>Quantity</th><th>Min. Required</th><th>Expiry</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const low = isLow(r);
                  const exp = isExpiring(r);
                  return (
                    <tr key={r.id} className={low ? "bg-amber-50/30" : ""}>
                      <td>
                        <div className="font-medium text-slate-800">{r.item_name}</div>
                        {r.supplier && <div className="text-xs text-slate-400">{r.supplier}</div>}
                      </td>
                      <td><span className="badge bg-slate-100 text-slate-600">{r.category}</span></td>
                      <td>
                        <span className={`font-bold ${low ? "text-amber-600" : "text-green-700"}`}>
                          {r.quantity} {r.unit}
                        </span>
                      </td>
                      <td className="text-slate-500">{r.minimum_quantity} {r.unit}</td>
                      <td className={`text-sm ${exp ? "text-red-600 font-medium" : "text-slate-500"}`}>
                        {r.expiry_date ? r.expiry_date.split("T")[0] : "N/A"}
                      </td>
                      <td>
                        {low
                          ? <Badge status="Low Stock" color="yellow" />
                          : <Badge status="In Stock" color="green" />
                        }
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Item" : "Add Inventory Item"} size="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Item Name *</label>
            <input className="input" value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} placeholder="e.g. Rice (kg)" />
          </div>
          <div>
            <label className="label">Category *</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">Select...</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Unit</label>
            <select className="input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
              <option value="">Select...</option>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Current Quantity *</label>
            <input className="input" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="label">Minimum Quantity</label>
            <input className="input" type="number" value={form.minimum_quantity} onChange={e => setForm({ ...form, minimum_quantity: e.target.value })} placeholder="Alert below this" />
          </div>
          <div>
            <label className="label">Expiry Date</label>
            <input className="input" type="date" value={form.expiry_date} onChange={e => setForm({ ...form, expiry_date: e.target.value })} />
          </div>
          <div>
            <label className="label">Supplier</label>
            <input className="input" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Item"}</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Item" message={`Delete "${deleteTarget?.item_name}" from inventory?`}
      />
    </div>
  );
}