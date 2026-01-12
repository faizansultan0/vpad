import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CampaignIcon from "@mui/icons-material/Campaign";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "@mui/material/Avatar";

const navLinks = [
  { path: "/", label: "Dashboard", icon: DashboardIcon },
  { path: "/users", label: "Users", icon: PeopleIcon },
  { path: "/admins", label: "Admins", icon: AdminPanelSettingsIcon },
  { path: "/announcements", label: "Announcements", icon: CampaignIcon },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <span className="text-white font-bold">VPad</span>
                <span className="block text-xs text-gray-400">Admin Panel</span>
              </div>
            </div>
            <button
              className="lg:hidden text-gray-400"
              onClick={() => setSidebarOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon fontSize="small" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar
                src={user?.profilePicture?.url}
                sx={{ width: 40, height: 40 }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <LogoutIcon fontSize="small" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600"
            >
              <MenuIcon />
            </button>
            <span className="font-bold gradient-text">VPad Admin</span>
            <Avatar
              src={user?.profilePicture?.url}
              sx={{ width: 32, height: 32 }}
            >
              {user?.name?.charAt(0)}
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
