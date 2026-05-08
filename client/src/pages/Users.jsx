import { useState, useEffect } from "react";
import { usersAPI } from "../services/api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";
import { EmptyState, ConfirmDialog } from "../components/SearchBar";
import toast from "react-hot-toast";
import {
  Users,
  Edit2,
  Trash2,
  Shield,
  Clock,
  ToggleLeft,
  ToggleRight,
  Plus,
  Lock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const EMPTY_NEW = {
  name: "",
  email: "",
  password: "",
  role: "staff",
  phone: "",
};

const roleColor = {
  admin: "bg-red-100 text-red-700",
  manager: "bg-blue-100 text-blue-700",
  staff: "bg-teal-100 text-teal-700",
  viewer: "bg-slate-100 text-slate-600",
};

export default function UsersPage() {
  const { user: me } = useAuth();
  const isAdmin = me?.role === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [form, setForm] = useState({});
  const [newForm, setNewForm] = useState(EMPTY_NEW);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.getAll();
      setUsers(data);
    } catch (e) {
      if (e.response?.status === 403) {
        toast.error("Access denied");
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const openEdit = (u) => {
    setForm({ ...u });
    setEditing(u.id);
  };
  const closeEdit = () => setEditing(null);

  const handleSave = async () => {
    if (!isAdmin) return toast.error("Only admins can edit users");
    setSaving(true);
    try {
      await usersAPI.update(editing, form);
      toast.success("User updated!");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!isAdmin) return toast.error("Only admins can create users");
    if (!newForm.name || !newForm.email || !newForm.password)
      return toast.error("Name, email and password are required");
    setSaving(true);
    try {
      await usersAPI.create(newForm);
      toast.success("User created!");
      setAddingNew(false);
      setNewForm(EMPTY_NEW);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await usersAPI.delete(deleteTarget.id);
      toast.success("User deleted");
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Delete failed");
    }
  };

  const roleCounts = (role) => users.filter((u) => u.role === role).length;

  // ── Non-admin view ─────────────────────────────────────────────
  if (!isAdmin && !loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center">
          <Lock size={36} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">
          Admin Access Required
        </h2>
        <p className="text-slate-500 text-sm text-center max-w-sm">
          User management is restricted to administrators only.
          <br />
          You can view your own profile from the sidebar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-display">
            User Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAdmin
              ? "Manage system users and their access roles"
              : "View system users (read-only)"}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setAddingNew(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Add User
          </button>
        )}
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {["admin", "manager", "staff", "viewer"].map((role) => (
          <div key={role} className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield
                size={18}
                className={
                  role === "admin"
                    ? "text-red-500"
                    : role === "manager"
                      ? "text-blue-500"
                      : role === "staff"
                        ? "text-teal-500"
                        : "text-slate-400"
                }
              />
              <span className={`badge text-xs capitalize ${roleColor[role]}`}>
                {role}
              </span>
            </div>
            <p className="text-3xl font-bold text-navy-900">
              {roleCounts(role)}
            </p>
            <p className="text-xs text-slate-400 mt-1 capitalize">{role}s</p>
          </div>
        ))}
      </div>

      {/* Users List */}
      <div className="card p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} message="No users found" />
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all
                  ${u.is_active ? "border-slate-100 bg-white hover:shadow-sm" : "border-slate-200 bg-slate-50 opacity-60"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                    u.role === "admin"
                      ? "bg-red-500"
                      : u.role === "manager"
                        ? "bg-blue-500"
                        : u.role === "staff"
                          ? "bg-teal-500"
                          : "bg-slate-400"
                  }`}
                >
                  {u.name?.[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-navy-900">
                      {u.name}
                    </span>
                    {u.id === me?.id && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        You
                      </span>
                    )}
                    <span
                      className={`badge text-xs capitalize ${roleColor[u.role]}`}
                    >
                      {u.role}
                    </span>
                    {!u.is_active && (
                      <span className="badge text-xs bg-slate-200 text-slate-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{u.email}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {u.last_login
                      ? `Last login: ${new Date(u.last_login).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}`
                      : "Never logged in"}
                  </p>
                </div>

                {/* Actions — admin only */}
                {isAdmin && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(u)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    {u.id !== me?.id && (
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <Modal title="Edit User" onClose={closeEdit} size="sm">
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                className="input"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={form.role || "staff"}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {["admin", "manager", "staff", "viewer"].map((r) => (
                  <option key={r} value={r} className="capitalize">
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, is_active: form.is_active ? 0 : 1 })
                }
                className="flex items-center gap-2 text-sm font-medium mt-1"
              >
                {form.is_active ? (
                  <ToggleRight size={28} className="text-teal-500" />
                ) : (
                  <ToggleLeft size={28} className="text-slate-300" />
                )}
                <span
                  className={
                    form.is_active ? "text-teal-600" : "text-slate-400"
                  }
                >
                  {form.is_active ? "Active" : "Inactive"}
                </span>
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={closeEdit} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* Add New User Modal */}
      {addingNew && (
        <Modal
          title="Add New User"
          onClose={() => setAddingNew(false)}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                className="input"
                value={newForm.name}
                onChange={(e) =>
                  setNewForm({ ...newForm, name: e.target.value })
                }
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                className="input"
                type="email"
                value={newForm.email}
                onChange={(e) =>
                  setNewForm({ ...newForm, email: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="label">Password *</label>
              <input
                className="input"
                type="password"
                value={newForm.password}
                onChange={(e) =>
                  setNewForm({ ...newForm, password: e.target.value })
                }
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={newForm.phone}
                onChange={(e) =>
                  setNewForm({ ...newForm, phone: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={newForm.role}
                onChange={(e) =>
                  setNewForm({ ...newForm, role: e.target.value })
                }
              >
                {["admin", "manager", "staff", "viewer"].map((r) => (
                  <option key={r} value={r} className="capitalize">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setAddingNew(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Permanently delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
