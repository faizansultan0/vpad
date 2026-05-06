import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore, useNoteStore } from "../../store";
import SchoolIcon from "@mui/icons-material/School";
import NoteIcon from "@mui/icons-material/Note";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AnimatedCounter from "../../components/ui/AnimatedCounter";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { institutions, notes, fetchInstitutions, fetchNotes } = useNoteStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchInstitutions(), fetchNotes({ limit: 5 })]);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = [
    {
      label: "Institutions",
      value: institutions.length,
      icon: SchoolIcon,
      color: "from-blue-500 to-blue-600",
      link: "/institutions",
    },
    {
      label: "Total Notes",
      value: notes.length,
      icon: NoteIcon,
      color: "from-green-500 to-emerald-600",
      link: "/institutions",
    },
    {
      label: "Shared Notes",
      value: 0,
      icon: FolderSharedIcon,
      color: "from-purple-500 to-violet-600",
      link: "/shared",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner — animated gradient with particles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-primary-500 to-secondary-600 rounded-3xl p-8 text-white"
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/50 via-secondary-500/30 to-primary-500/50 animate-gradient-x" style={{ backgroundSize: "200% 200%" }} />

        {/* Floating orbs */}
        <div className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full bg-white/10 animate-blob" />
        <div className="absolute bottom-[-20px] left-[20%] w-28 h-28 rounded-full bg-white/5 animate-blob-delayed" />

        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {getGreeting()}, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-white/80">
            Welcome back to VPad. Ready to continue your learning journey?
          </p>
        </div>
      </motion.div>

      {/* Stat cards — glass with animated counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={stat.link}
                className="glass-card block hover:shadow-glow transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">
                      {stat.label}
                    </p>
                    <AnimatedCounter
                      value={stat.value}
                      duration={1.5}
                      className="text-3xl font-bold mt-1 block"
                      style={{ color: "var(--color-text)" }}
                    />
                  </div>
                  <motion.div
                    className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="text-white" />
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions + Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { to: "/institutions", icon: AddIcon, label: "Add Institution", sub: "Create new", gradient: "gradient-bg" },
              { to: "/institutions", icon: NoteIcon, label: "New Note", sub: "Start writing", gradient: "bg-gradient-to-br from-green-500 to-emerald-600" },
              { to: "/shared", icon: FolderSharedIcon, label: "Shared Notes", sub: "Collaborate", gradient: "bg-gradient-to-br from-purple-500 to-violet-600" },
              { to: "/notifications", icon: NotificationsIcon, label: "Notifications", sub: "Stay updated", gradient: "bg-gradient-to-br from-orange-500 to-amber-600" },
            ].map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <motion.div
                  key={action.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={action.to}
                    className="flex items-center space-x-3 p-4 rounded-xl transition-all duration-200 group border border-transparent hover:border-primary-500/20"
                    style={{ background: "var(--color-action-card-bg)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-action-card-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "var(--color-action-card-bg)"}
                  >
                    <motion.div
                      className={`w-10 h-10 rounded-lg ${action.gradient} flex items-center justify-center shadow-sm`}
                      whileHover={{ rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <ActionIcon className="text-white" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: "var(--color-text)" }}>
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        {action.sub}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
              Recent Notes
            </h2>
            <Link
              to="/institutions"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              View All
            </Link>
          </div>
          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.slice(0, 5).map((note, idx) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                >
                  <Link
                    to={`/notes/${note._id}`}
                    className="flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group border border-transparent hover:border-primary-500/10"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-action-card-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                      style={{
                        backgroundColor: note.subject?.color || "#667eea",
                      }}
                    >
                      <NoteIcon className="text-white" fontSize="small" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary-400 transition-colors" style={{ color: "var(--color-text)" }}>
                        {note.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {note.subject?.name}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <NoteIcon
                className="text-gray-600 mb-2"
                style={{ fontSize: 48 }}
              />
              <p>No notes yet</p>
              <p className="text-sm">Create your first note to get started</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Institutions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            Your Institutions
          </h2>
          <Link
            to="/institutions"
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            Manage
          </Link>
        </div>
        {institutions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.map((inst, idx) => (
              <motion.div
                key={inst._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.08 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/institutions/${inst._id}/content`}
                  className="block p-4 rounded-xl border transition-all duration-200"
                  style={{ background: "var(--color-institution-card-bg)", borderColor: "var(--color-border)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: inst.color || "#667eea" }}
                      whileHover={{ rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <SchoolIcon className="text-white" />
                    </motion.div>
                    <div>
                      <p className="font-medium" style={{ color: "var(--color-text)" }}>
                        {inst.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {inst.type}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <SchoolIcon
              className="text-gray-600 mb-2"
              style={{ fontSize: 48 }}
            />
            <p className="text-gray-500">No institutions yet</p>
            <Link to="/institutions" className="btn-primary btn-glow mt-4 inline-block">
              <AddIcon className="mr-1" /> Add Institution
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
