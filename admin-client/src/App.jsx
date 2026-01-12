import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Admins from "./pages/Admins";
import Announcements from "./pages/Announcements";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !["admin", "superadmin"].includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const { isAuthenticated, getMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) getMe();
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <Login />}
      />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/announcements" element={<Announcements />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
