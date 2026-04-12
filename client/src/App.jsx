import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore, useSocketStore, useNotificationStore } from "./store";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/public/Home";
import Services from "./pages/public/Services";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Terms from "./pages/public/Terms";
import Privacy from "./pages/public/Privacy";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

import Dashboard from "./pages/dashboard/Dashboard";
import Institutions from "./pages/dashboard/Institutions";
import InstitutionContent from "./pages/dashboard/InstitutionContent";
import Semesters from "./pages/dashboard/Semesters";
import Subjects from "./pages/dashboard/Subjects";
import Notes from "./pages/dashboard/Notes";
import NoteEditor from "./pages/dashboard/NoteEditor";
import SharedNotes from "./pages/dashboard/SharedNotes";
import Profile from "./pages/dashboard/Profile";
import Notifications from "./pages/dashboard/Notifications";

function App() {
  const { isAuthenticated, accessToken, getMe } = useAuthStore();
  const { connect, disconnect } = useSocketStore();
  const { addNotification, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      getMe().catch(console.error);
      connect(accessToken);
      fetchUnreadCount();

      const socket = useSocketStore.getState().socket;
      if (socket) {
        socket.on("notification", addNotification);
      }

      return () => {
        if (socket) {
          socket.off("notification", addNotification);
        }
      };
    } else {
      disconnect();
    }
  }, [isAuthenticated, accessToken]);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/institutions" element={<Institutions />} />
        <Route
          path="/institutions/:institutionId/content"
          element={<InstitutionContent />}
        />
        <Route
          path="/institutions/:institutionId/semesters"
          element={<Navigate to="../content" replace />}
        />
        <Route path="/semesters/:semesterId/subjects" element={<Subjects />} />
        <Route path="/subjects/:subjectId/notes" element={<Notes />} />
        <Route path="/notes/:noteId" element={<NoteEditor />} />
        <Route path="/shared" element={<SharedNotes />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
