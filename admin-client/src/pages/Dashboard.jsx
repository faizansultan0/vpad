import { useEffect } from "react";
import useAdminStore from "../store/adminStore";
import { motion } from "framer-motion";
import PeopleIcon from "@mui/icons-material/People";
import NoteIcon from "@mui/icons-material/Note";
import ShareIcon from "@mui/icons-material/Share";
import SchoolIcon from "@mui/icons-material/School";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Avatar from "@mui/material/Avatar";
import { format } from "date-fns";

export default function Dashboard() {
  const { stats, fetchDashboard, isLoading } = useAdminStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading || !stats)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );

  const statCards = [
    {
      label: "Total Users",
      value: stats.stats?.totalUsers || 0,
      icon: PeopleIcon,
      color: "bg-blue-500",
    },
    {
      label: "Active Users",
      value: stats.stats?.activeUsers || 0,
      icon: PeopleIcon,
      color: "bg-green-500",
    },
    {
      label: "Total Notes",
      value: stats.stats?.totalNotes || 0,
      icon: NoteIcon,
      color: "bg-purple-500",
    },
    {
      label: "Shared Notes",
      value: stats.stats?.sharedNotes || 0,
      icon: ShareIcon,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of VPad platform statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User Growth (30 Days)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="_id"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#667eea"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Users
          </h2>
          <div className="space-y-3">
            {stats.recentUsers?.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <Avatar sx={{ width: 36, height: 36 }}>
                    {user.name?.charAt(0)}
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    user.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Notes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b">
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Author</th>
                <th className="pb-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentNotes?.map((note) => (
                <tr key={note._id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-900">
                    {note.title}
                  </td>
                  <td className="py-3 text-gray-600">{note.user?.name}</td>
                  <td className="py-3 text-gray-500 text-sm">
                    {format(new Date(note.createdAt), "MMM d, yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
