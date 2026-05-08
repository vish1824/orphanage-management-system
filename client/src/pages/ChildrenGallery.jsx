import { useEffect, useState } from "react";
import { childrenAPI } from "../services/api";
import { adoptionsAPI } from "../services/api";
import Modal from "../components/Modal";
import { SearchBar, LoadingSpinner } from "../components/SearchBar";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  Heart,
  Star,
  BookOpen,
  Smile,
  MapPin,
  Calendar,
  Send,
  Eye,
} from "lucide-react";

const AVATAR_COLORS = [
  "from-rose-400 to-pink-600",
  "from-blue-400 to-indigo-600",
  "from-teal-400 to-cyan-600",
  "from-amber-400 to-orange-500",
  "from-purple-400 to-violet-600",
  "from-green-400 to-emerald-600",
  "from-red-400 to-rose-600",
  "from-sky-400 to-blue-600",
];

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

function ChildCard({ child, onAdopt, onView, index }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden hover:shadow-hover transition-all duration-300 hover:-translate-y-1 group">
      {/* Card Top */}
      <div
        className={`bg-gradient-to-br ${color} p-6 flex flex-col items-center relative`}
      >
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold shadow-lg border-2 border-white/40">
          {child.name?.[0]?.toUpperCase()}
        </div>
        <h3 className="text-white font-bold text-lg mt-3 text-center drop-shadow">
          {child.name}
        </h3>
        <p className="text-white/80 text-sm">
          {age(child.date_of_birth)} years • {child.gender}
        </p>
        <div className="absolute top-3 right-3">
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
            {child.admission_type}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {child.dream && (
          <div className="flex items-start gap-2">
            <Star size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600 leading-snug">
              Dream:{" "}
              <span className="font-medium text-slate-800">{child.dream}</span>
            </p>
          </div>
        )}
        {child.hobby && (
          <div className="flex items-start gap-2">
            <Smile size={14} className="text-teal-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">
              Hobby:{" "}
              <span className="font-medium text-slate-800">{child.hobby}</span>
            </p>
          </div>
        )}
        {child.favourite_subject && (
          <div className="flex items-start gap-2">
            <BookOpen size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">
              Favourite:{" "}
              <span className="font-medium text-slate-800">
                {child.favourite_subject}
              </span>
            </p>
          </div>
        )}
        {child.hometown && (
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-rose-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-500">{child.hometown}</p>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => onView(child)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
        >
          <Eye size={14} /> View
        </button>
        <button
          onClick={() => onAdopt(child)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <Heart size={14} /> Adopt
        </button>
      </div>
    </div>
  );
}

export default function ChildrenGallery() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genderF, setGenderF] = useState("All");
  const [typeF, setTypeF] = useState("All");
  const [viewChild, setViewChild] = useState(null);
  const [adoptChild, setAdoptChild] = useState(null);
  const [adoptForm, setAdoptForm] = useState({
    adoptive_parent_name: "",
    contact_number: "",
    email: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    childrenAPI
      .getAll()
      .then((r) => setChildren(r.data.filter((c) => c.status === "Active")))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = children.filter((c) => {
    const q = search.toLowerCase();
    const ms =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.hometown?.toLowerCase().includes(q) ||
      c.dream?.toLowerCase().includes(q) ||
      c.hobby?.toLowerCase().includes(q);
    const mg = genderF === "All" || c.gender === genderF;
    const mt = typeF === "All" || c.admission_type === typeF;
    return ms && mg && mt;
  });

  const handleAdoptSubmit = async () => {
    if (!adoptForm.adoptive_parent_name || !adoptForm.contact_number)
      return toast.error("Name and contact number are required");
    setSubmitting(true);
    try {
      await adoptionsAPI.create({
        child_id: adoptChild.id,
        adoptive_parent_name: adoptForm.adoptive_parent_name,
        contact_number: adoptForm.contact_number,
        email: adoptForm.email,
        address: adoptForm.address,
        application_date: new Date().toISOString().split("T")[0],
        status: "Pending",
        notes: `Application submitted online by ${user?.name || "visitor"}`,
      });
      toast.success(
        "🎉 Adoption application submitted! We will contact you soon.",
      );
      setAdoptChild(null);
      setAdoptForm({
        adoptive_parent_name: "",
        contact_number: "",
        email: "",
        address: "",
      });
    } catch (e) {
      toast.error(e.response?.data?.error || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-teal-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: `${(i + 1) * 150}px`,
                height: `${(i + 1) * 150}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold font-display mb-2">
            💛 Meet Our Children
          </h1>
          <p className="text-white/80 text-lg">
            Every child here has a story, a dream, and a heart full of hope. You
            can make a difference.
          </p>
          <div className="flex gap-6 mt-4 text-sm">
            <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
              <span className="font-bold text-2xl block">
                {children.length}
              </span>
              <span className="text-white/70">Children</span>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
              <span className="font-bold text-2xl block">
                {children.filter((c) => c.gender === "Male").length}
              </span>
              <span className="text-white/70">Boys</span>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
              <span className="font-bold text-2xl block">
                {children.filter((c) => c.gender === "Female").length}
              </span>
              <span className="text-white/70">Girls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, dream, hobby or hometown..."
          />
        </div>
        <select
          className="input w-auto"
          value={genderF}
          onChange={(e) => setGenderF(e.target.value)}
        >
          <option value="All">All Genders</option>
          <option>Male</option>
          <option>Female</option>
        </select>
        <select
          className="input w-auto"
          value={typeF}
          onChange={(e) => setTypeF(e.target.value)}
        >
          <option value="All">All Types</option>
          {["Orphan", "Half-Orphan", "Abandoned", "Surrendered"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <p className="text-slate-500 text-sm">
        Showing {filtered.length} of {children.length} children
      </p>

      {loading ? (
        <LoadingSpinner text="Loading children..." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((child, i) => (
            <ChildCard
              key={child.id}
              child={child}
              index={i}
              onView={setViewChild}
              onAdopt={(c) => {
                setAdoptChild(c);
                setAdoptForm({
                  adoptive_parent_name: user?.name || "",
                  contact_number: "",
                  email: user?.email || "",
                  address: "",
                });
              }}
            />
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewChild && (
        <Modal
          title="Child Profile"
          onClose={() => setViewChild(null)}
          size="md"
        >
          <div className="space-y-4">
            <div
              className={`bg-gradient-to-br ${AVATAR_COLORS[0]} rounded-2xl p-6 flex items-center gap-5`}
            >
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-2 border-white/40">
                {viewChild.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">
                  {viewChild.name}
                </h2>
                <p className="text-white/80">
                  {age(viewChild.date_of_birth)} years • {viewChild.gender}
                </p>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {viewChild.admission_type}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["🌟 Dream", viewChild.dream],
                ["🎨 Hobby", viewChild.hobby],
                ["📚 Favourite Subject", viewChild.favourite_subject],
                ["📍 Hometown", viewChild.hometown],
                ["🎂 Date of Birth", viewChild.date_of_birth?.split("T")[0]],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">{k}</p>
                    <p className="font-medium text-slate-800 text-sm">{v}</p>
                  </div>
                ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setViewChild(null);
                  setAdoptChild(viewChild);
                  setAdoptForm({
                    adoptive_parent_name: user?.name || "",
                    contact_number: "",
                    email: user?.email || "",
                    address: "",
                  });
                }}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Heart size={16} /> Apply to Adopt
              </button>
              <button
                onClick={() => setViewChild(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Adopt Modal */}
      {adoptChild && (
        <Modal
          title={`Apply to Adopt ${adoptChild.name}`}
          onClose={() => setAdoptChild(null)}
          size="md"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p className="text-amber-800 text-sm">
              📋 Your application will be reviewed by our team. We will contact
              you within 3-5 working days.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Your Full Name *</label>
              <input
                className="input"
                value={adoptForm.adoptive_parent_name}
                onChange={(e) =>
                  setAdoptForm({
                    ...adoptForm,
                    adoptive_parent_name: e.target.value,
                  })
                }
                placeholder="Full legal name"
              />
            </div>
            <div>
              <label className="label">Contact Number *</label>
              <input
                className="input"
                value={adoptForm.contact_number}
                onChange={(e) =>
                  setAdoptForm({ ...adoptForm, contact_number: e.target.value })
                }
                placeholder="Your phone number"
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                value={adoptForm.email}
                onChange={(e) =>
                  setAdoptForm({ ...adoptForm, email: e.target.value })
                }
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="label">Your Address / City</label>
              <input
                className="input"
                value={adoptForm.address}
                onChange={(e) =>
                  setAdoptForm({ ...adoptForm, address: e.target.value })
                }
                placeholder="City, State"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setAdoptChild(null)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleAdoptSubmit}
              disabled={submitting}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
