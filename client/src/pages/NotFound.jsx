import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={48} className="text-white" />
        </div>
        <h1 className="text-8xl font-bold text-white font-display mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white/80 mb-2">Page Not Found</h2>
        <p className="text-white/60 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          <Home size={18} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}