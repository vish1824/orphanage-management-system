import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import ChildrenGallery from "./pages/ChildrenGallery";
import Staff from "./pages/Staff";
import Donations from "./pages/Donations";
import Medical from "./pages/Medical";
import Education from "./pages/Education";
import Adoptions from "./pages/Adoptions";
import Expenses from "./pages/Expenses";
import Inventory from "./pages/Inventory";
import Events from "./pages/Events";
import Reports from "./pages/Reports";
import ActivityLogs from "./pages/ActivityLogs";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-navy-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return !user ? children : <Navigate to="/" replace />;
}

// All app routes — inside AuthProvider so useAuth() works
function AppRoutes() {
  const { user, token } = useAuth();
  const isViewer = user?.role === "viewer";

  return (
    <SocketProvider token={token}>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={isViewer ? <ChildrenGallery /> : <Dashboard />}
          />
          <Route path="children" element={<Children />} />
          <Route path="gallery" element={<ChildrenGallery />} />
          <Route path="staff" element={<Staff />} />
          <Route path="donations" element={<Donations />} />
          <Route path="medical" element={<Medical />} />
          <Route path="education" element={<Education />} />
          <Route path="adoptions" element={<Adoptions />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="events" element={<Events />} />
          <Route path="reports" element={<Reports />} />
          <Route path="logs" element={<ActivityLogs />} />
          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
