import { useEffect, useState } from "react";
import useAdminStore from "../store/adminStore";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import EmailIcon from "@mui/icons-material/Email";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";

const allPermissions = [
  "manage_users",
  "manage_admins",
  "manage_notes",
  "send_announcements",
  "view_analytics",
  "manage_settings",
];

export default function Admins() {
  const { user } = useAuthStore();
  const {
    admins,
    fetchAdmins,
    createAdmin,
    inviteAdmin,
    updateAdminPermissions,
    removeAdmin,
    isLoading,
  } = useAdminStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({ email: "", permissions: [] });
  const [inviteData, setInviteData] = useState({ email: "", permissions: [] });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const isSuperAdmin = user?.role === "superadmin";

  const openModal = (admin = null) => {
    if (admin) {
      setEditingAdmin(admin);
      setFormData({ email: admin.email, permissions: admin.permissions || [] });
    } else {
      setEditingAdmin(null);
      setFormData({ email: "", permissions: [] });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await updateAdminPermissions(editingAdmin._id, formData.permissions);
        toast.success("Permissions updated");
      } else {
        await createAdmin(formData);
        toast.success("Admin created");
      }
      setModalOpen(false);
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleRemove = async (admin) => {
    if (confirm(`Remove admin privileges from ${admin.name}?`)) {
      try {
        await removeAdmin(admin._id);
        toast.success("Admin removed");
      } catch (error) {
        toast.error("Failed to remove admin");
      }
    }
  };

  const togglePermission = (perm) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">
            Manage administrators and their permissions
          </p>
        </div>
        {isSuperAdmin && (
          <div className="flex space-x-3">
            <button
              onClick={() => setInviteModalOpen(true)}
              className="btn-secondary flex items-center"
            >
              <EmailIcon className="mr-1" fontSize="small" /> Invite Admin
            </button>
            <button
              onClick={() => openModal()}
              className="btn-primary flex items-center"
            >
              <AddIcon className="mr-1" /> Promote User
            </button>
          </div>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
          Only superadmins can manage other administrators.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {admins.map((admin) => (
            <div key={admin._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={admin.profilePicture?.url}
                    sx={{ width: 48, height: 48 }}
                  >
                    {admin.name?.charAt(0)}
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">{admin.name}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                </div>
                {isSuperAdmin && admin.role !== "superadmin" && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openModal(admin)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <EditIcon fontSize="small" className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleRemove(admin)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <DeleteIcon fontSize="small" className="text-red-500" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    admin.role === "superadmin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {admin.role === "superadmin" ? "Super Admin" : "Admin"}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    admin.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {admin.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {admin.permissions?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {admin.permissions.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {p.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
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
              {editingAdmin ? "Edit Admin Permissions" : "Add New Admin"}
            </h2>
            <button
              onClick={() => setModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <CloseIcon />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-field"
                  placeholder="user@example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  The user must already have a VPad account
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="space-y-2">
                {allPermissions.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <span className="text-sm capitalize">
                      {perm.replace(/_/g, " ")}
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingAdmin ? "Update" : "Create Admin"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      <Dialog
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Invite New Admin</h2>
            <button
              onClick={() => setInviteModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <CloseIcon />
            </button>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await inviteAdmin(inviteData);
                toast.success("Invitation sent successfully");
                setInviteModalOpen(false);
                setInviteData({ email: "", permissions: [] });
                fetchAdmins();
              } catch (error) {
                toast.error(
                  error.response?.data?.message || "Failed to send invitation",
                );
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData({ ...inviteData, email: e.target.value })
                }
                className="input-field"
                placeholder="newadmin@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                An invitation email will be sent to set up their account
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="space-y-2">
                {allPermissions.map((perm) => (
                  <label
                    key={perm}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <span className="text-sm capitalize">
                      {perm.replace(/_/g, " ")}
                    </span>
                    <input
                      type="checkbox"
                      checked={inviteData.permissions.includes(perm)}
                      onChange={() =>
                        setInviteData((prev) => ({
                          ...prev,
                          permissions: prev.permissions.includes(perm)
                            ? prev.permissions.filter((p) => p !== perm)
                            : [...prev.permissions, perm],
                        }))
                      }
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
