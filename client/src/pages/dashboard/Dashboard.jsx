import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore, useNoteStore } from "../../store";
import SchoolIcon from "@mui/icons-material/School";
import NoteIcon from "@mui/icons-material/Note";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";

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
      color: "bg-blue-500",
      link: "/institutions",
    },
    {
      label: "Total Notes",
      value: notes.length,
      icon: NoteIcon,
      color: "bg-green-500",
      link: "/institutions",
    },
    {
      label: "Shared Notes",
      value: 0,
      icon: FolderSharedIcon,
      color: "bg-purple-500",
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-3xl p-8 text-white"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {getGreeting()}, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-white/80">
          Welcome back to VPad. Ready to continue your learning journey?
        </p>
      </motion.div>

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
                className="card block hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              <span className="dark:text-gray-100">Quick Actions</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/institutions"
              className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                <AddIcon className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Add Institution</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create new</p>
              </div>
            </Link>
            <Link
              to="/institutions"
              className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                <NoteIcon className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">New Note</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Start writing</p>
              </div>
            </Link>
            <Link
              to="/shared"
              className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                <FolderSharedIcon className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Shared Notes</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Collaborate</p>
              </div>
            </Link>
            <Link
              to="/notifications"
              className="flex items-center space-x-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <NotificationsIcon className="text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Notifications</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Stay updated</p>
              </div>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              <span className="dark:text-gray-100">Recent Notes</span>
            </h2>
            <Link
              to="/institutions"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.slice(0, 5).map((note) => (
                <Link
                  key={note._id}
                  to={`/notes/${note._id}`}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: note.subject?.color || "#667eea",
                    }}
                  >
                    <NoteIcon className="text-white" fontSize="small" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {note.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {note.subject?.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <NoteIcon
                className="text-gray-300 dark:text-gray-600 mb-2"
                style={{ fontSize: 48 }}
              />
              <p>No notes yet</p>
              <p className="text-sm">Create your first note to get started</p>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            <span className="dark:text-gray-100">Your Institutions</span>
          </h2>
          <Link
            to="/institutions"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Manage
          </Link>
        </div>
        {institutions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.map((inst) => (
              <Link
                key={inst._id}
                to={`/institutions/${inst._id}/content`}
                className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-500/40 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: inst.color || "#667eea" }}
                  >
                    <SchoolIcon className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{inst.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {inst.type}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <SchoolIcon
              className="text-gray-300 mb-2"
              style={{ fontSize: 48 }}
            />
            <p className="text-gray-500">No institutions yet</p>
            <Link to="/institutions" className="btn-primary mt-4 inline-block">
              <AddIcon className="mr-1" /> Add Institution
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
