import { useState } from "react";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { User, Lock, Shield, Mail, Phone, Clock, Save } from "lucide-react";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateProfile(form);
      setUser(prev => ({ ...prev, ...form }));
      toast.success("Profile updated!");
    } catch (e) { toast.error(e.response?.data?.error || "Update failed"); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error("Passwords don't match");
    if (pwForm.newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setChangingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) { toast.error(e.response?.data?.error || "Failed to change password"); }
    finally { setChangingPw(false); }
  };

  const roleColors = { admin: "bg-red-100 text-red-700", manager: "bg-blue-100 text-blue-700", staff: "bg-green-100 text-green-700", viewer: "bg-slate-100 text-slate-600" };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-display">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy-600 to-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy-900">{user?.name}</h2>
            <p className="text-slate-500 text-sm flex items-center gap-1 mt-1"><Mail size={13} />{user?.email}</p>
            <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full capitalize ${roleColors[user?.role] || "bg-slate-100 text-slate-600"}`}>
              <Shield className="inline w-3 h-3 mr-1" />{user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfile} className="space-y-4">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2"><User size={16} /> Personal Information</h3>
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Your phone number" />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input value={user?.email} disabled className="input bg-slate-50 cursor-not-allowed opacity-70" />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed. Contact admin if needed.</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={15} />{saving ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <form onSubmit={handlePassword} className="space-y-4">
          <h3 className="font-semibold text-navy-900 flex items-center gap-2"><Lock size={16} /> Change Password</h3>
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} placeholder="Enter current password" required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} placeholder="Minimum 6 characters" required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Re-enter new password" required />
          </div>
          <button type="submit" disabled={changingPw} className="btn-primary flex items-center gap-2">
            <Lock size={15} />{changingPw ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="card p-6 bg-slate-50">
        <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2"><Clock size={16} /> Account Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500 text-xs">Account Role</p>
            <p className="font-medium capitalize text-navy-900">{user?.role}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs">User ID</p>
            <p className="font-medium text-navy-900">#{user?.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}