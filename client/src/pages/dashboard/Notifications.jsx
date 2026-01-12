import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "../../store";
import toast from "react-hot-toast";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NoteIcon from "@mui/icons-material/Note";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import CampaignIcon from "@mui/icons-material/Campaign";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import Avatar from "@mui/material/Avatar";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (type) => {
  switch (type) {
    case "note_shared":
      return ShareIcon;
    case "note_edited":
      return NoteIcon;
    case "comment_added":
    case "comment_reply":
      return CommentIcon;
    case "announcement":
      return CampaignIcon;
    default:
      return NotificationsIcon;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case "note_shared":
      return "bg-blue-500";
    case "note_edited":
      return "bg-green-500";
    case "comment_added":
    case "comment_reply":
      return "bg-purple-500";
    case "announcement":
      return "bg-orange-500";
    default:
      return "bg-gray-500";
  }
};

export default function Notifications() {
  const {
    notifications,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading,
  } = useNotificationStore();
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchNotifications({ unreadOnly: filter === "unread" });
  }, [filter]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    toast.success("All notifications marked as read");
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    toast.success("Notification deleted");
  };

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.isRead);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your activity</p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary flex items-center text-sm"
          >
            <DoneAllIcon fontSize="small" className="mr-1" /> Mark All Read
          </button>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-primary-100 text-primary-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "unread"
              ? "bg-primary-100 text-primary-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Unread
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence>
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);

              return (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`card flex items-start space-x-4 ${
                    !notification.isRead
                      ? "bg-primary-50/50 border-primary-100"
                      : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="text-white" fontSize="small" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-3 mt-2">
                          {notification.sender && (
                            <div className="flex items-center space-x-1">
                              <Avatar
                                src={notification.sender.profilePicture?.url}
                                sx={{ width: 16, height: 16 }}
                              >
                                {notification.sender.name?.charAt(0)}
                              </Avatar>
                              <span className="text-xs text-gray-500">
                                {notification.sender.name}
                              </span>
                            </div>
                          )}
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg"
                            title="Mark as read"
                          >
                            <CheckIcon
                              fontSize="small"
                              className="text-gray-400"
                            />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <DeleteIcon
                            fontSize="small"
                            className="text-gray-400 hover:text-red-500"
                          />
                        </button>
                      </div>
                    </div>

                    {notification.data?.link && (
                      <Link
                        to={notification.data.link}
                        className="inline-block mt-2 text-sm text-primary-600 hover:text-primary-700"
                      >
                        View Details →
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {pagination && pagination.page < pagination.totalPages && (
            <button
              onClick={() => fetchNotifications({ page: pagination.page + 1 })}
              className="w-full py-3 text-center text-primary-600 hover:bg-gray-50 rounded-xl"
            >
              Load More
            </button>
          )}
        </div>
      ) : (
        <div className="card text-center py-16">
          <NotificationsIcon
            className="text-gray-300 mb-4"
            style={{ fontSize: 64 }}
          />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === "unread"
              ? "No Unread Notifications"
              : "No Notifications"}
          </h3>
          <p className="text-gray-600">
            {filter === "unread"
              ? "You're all caught up!"
              : "Notifications about your activity will appear here"}
          </p>
        </div>
      )}
    </div>
  );
}
