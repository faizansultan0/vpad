import { useEffect, useState } from "react";
import useAdminStore from "../store/adminStore";
import toast from "react-hot-toast";
import SearchIcon from "@mui/icons-material/Search";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import { format } from "date-fns";

export default function Users() {
  const { users, pagination, fetchUsers, updateUser, deleteUser, isLoading } =
    useAdminStore();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers({ search });
  };

  const handleToggleActive = async (user) => {
    try {
      await updateUser(user._id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? "deactivated" : "activated"}`);
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name} permanently? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteUser(user._id);
      if (selectedUser?._id === user._id) {
        setSelectedUser(null);
      }
      toast.success("User deleted permanently");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage registered users</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-md">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
          placeholder="Search users by name or email..."
        />
      </form>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={user.profilePicture?.url}
                          sx={{ width: 36, height: 36 }}
                        >
                          {user.name?.charAt(0)}
                        </Avatar>
                        <span className="font-medium text-gray-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {format(new Date(user.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                          title="View Details"
                        >
                          👁
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`p-2 rounded-lg ${
                            user.isActive
                              ? "hover:bg-red-50 text-red-500"
                              : "hover:bg-green-50 text-green-500"
                          }`}
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          {user.isActive ? (
                            <BlockIcon fontSize="small" />
                          ) : (
                            <CheckCircleIcon fontSize="small" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                          title="Delete Permanently"
                        >
                          <DeleteForeverIcon fontSize="small" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => fetchUsers({ page: pagination.page - 1 })}
                  disabled={!pagination.hasPrevPage}
                  className="btn-secondary text-sm py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchUsers({ page: pagination.page + 1 })}
                  disabled={!pagination.hasNextPage}
                  className="btn-secondary text-sm py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedUser && (
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar
                src={selectedUser.profilePicture?.url}
                sx={{ width: 64, height: 64 }}
              >
                {selectedUser.name?.charAt(0)}
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{selectedUser.name}</h2>
                <p className="text-gray-500">{selectedUser.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Role</span>
                <span className="capitalize">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Status</span>
                <span
                  className={
                    selectedUser.isActive ? "text-green-600" : "text-red-600"
                  }
                >
                  {selectedUser.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Email Verified</span>
                <span>{selectedUser.isEmailVerified ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Joined</span>
                <span>{format(new Date(selectedUser.createdAt), "PPP")}</span>
              </div>
              {selectedUser.lastLogin && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Last Login</span>
                  <span>{format(new Date(selectedUser.lastLogin), "PPP")}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
