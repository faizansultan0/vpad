import { useEffect, useState } from "react";
import useAdminStore from "../store/adminStore";
import toast from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CampaignIcon from "@mui/icons-material/Campaign";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";

const announcementTypes = [
  "info",
  "warning",
  "success",
  "update",
  "maintenance",
];
const priorities = ["low", "normal", "high", "urgent"];
const audiences = ["all", "users", "admins"];

export default function Announcements() {
  const {
    announcements,
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    isLoading,
  } = useAdminStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "normal",
    targetAudience: "all",
    sendEmail: false,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        priority: announcement.priority,
        targetAudience: announcement.targetAudience,
        sendEmail: false,
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: "",
        message: "",
        type: "info",
        priority: "normal",
        targetAudience: "all",
        sendEmail: false,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement._id, formData);
        toast.success("Announcement updated");
      } else {
        await createAnnouncement(formData);
        toast.success("Announcement sent");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this announcement?")) {
      try {
        await deleteAnnouncement(id);
        toast.success("Announcement deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      info: "bg-blue-100 text-blue-700",
      warning: "bg-yellow-100 text-yellow-700",
      success: "bg-green-100 text-green-700",
      update: "bg-purple-100 text-purple-700",
      maintenance: "bg-orange-100 text-orange-700",
    };
    return colors[type] || colors.info;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-gray-100 text-gray-700",
      normal: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return colors[priority] || colors.normal;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Send announcements to all users</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center"
        >
          <AddIcon className="mr-1" /> New Announcement
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <CampaignIcon className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{ann.title}</h3>
                    <p className="text-gray-600 mt-1">{ann.message}</p>
                    <div className="flex items-center space-x-2 mt-3">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(
                          ann.type
                        )}`}
                      >
                        {ann.type}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(
                          ann.priority
                        )}`}
                      >
                        {ann.priority}
                      </span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                        To: {ann.targetAudience}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(ann.createdAt), "MMM d, yyyy h:mm a")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openModal(ann)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <EditIcon fontSize="small" className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <DeleteIcon fontSize="small" className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <CampaignIcon
            className="text-gray-300 mb-4"
            style={{ fontSize: 64 }}
          />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Announcements
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first announcement to notify users
          </p>
          <button
            onClick={() => openModal()}
            className="btn-primary inline-flex items-center"
          >
            <AddIcon className="mr-1" /> New Announcement
          </button>
        </div>
      )}

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
            </h2>
            <button
              onClick={() => setModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <CloseIcon />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input-field"
                placeholder="Announcement title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="input-field"
                rows={4}
                placeholder="Announcement message..."
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="input-field"
                >
                  {announcementTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="input-field"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAudience: e.target.value })
                  }
                  className="input-field"
                >
                  {audiences.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {!editingAnnouncement && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.sendEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, sendEmail: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  Also send via email
                </span>
              </label>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingAnnouncement ? "Update" : "Send Announcement"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
