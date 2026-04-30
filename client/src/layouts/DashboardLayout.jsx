import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore, useNotificationStore } from "../store";
import { motion, AnimatePresence } from "framer-motion";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";

const sidebarLinks = [
  { path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { path: "/institutions", label: "Institutions", icon: SchoolIcon },
  { path: "/shared", label: "Shared Notes", icon: FolderSharedIcon },
  { path: "/notifications", label: "Notifications", icon: NotificationsIcon },
  { path: "/profile", label: "Profile", icon: PersonIcon },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Force dark mode on html element for any Tailwind dark: prefixes in dashboard pages
    document.documentElement.classList.add("dark");
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex text-gray-100">
      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "rgba(10, 1, 24, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Purple accent line on left edge */}
        <div className="absolute top-0 left-0 bottom-0 w-px bg-gradient-to-b from-primary-500/50 via-primary-400/20 to-transparent" />

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <motion.div
                className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-glow"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-white font-bold text-xl">V</span>
              </motion.div>
              <span className="text-xl font-bold gradient-text">VPad</span>
            </Link>
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              const showBadge =
                link.path === "/notifications" && unreadCount > 0;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "text-primary-300"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  style={
                    isActive
                      ? { background: "rgba(139, 92, 246, 0.1)", boxShadow: "inset 0 0 20px rgba(139, 92, 246, 0.05)" }
                      : undefined
                  }
                >
                  {/* Active indicator border */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-indicator"
                      className="absolute inset-0 rounded-xl border border-primary-400/30"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {showBadge ? (
                    <Badge badgeContent={unreadCount} color="error" max={99}>
                      <Icon fontSize="small" />
                    </Badge>
                  ) : (
                    <Icon fontSize="small" />
                  )}
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center space-x-3 mb-4">
              <Avatar
                src={user?.profilePicture?.url}
                alt={user?.name}
                className="w-10 h-10"
                sx={{ bgcolor: "#6d28d9" }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-400 rounded-xl transition-colors"
              style={{ background: "rgba(239, 68, 68, 0.08)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
            >
              <LogoutIcon fontSize="small" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="sticky top-0 z-30 lg:hidden shimmer-line"
          style={{
            background: "rgba(10, 1, 24, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center justify-between px-4 h-16">
            <button
              className="p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-glow">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="font-bold gradient-text">VPad</span>
            </Link>
            <Link to="/profile">
              <Avatar
                src={user?.profilePicture?.url}
                alt={user?.name}
                className="w-8 h-8"
                sx={{ bgcolor: "#6d28d9" }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto text-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
