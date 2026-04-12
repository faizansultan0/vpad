import { useEffect, useMemo, useState } from "react";
import useAdminStore from "../store/adminStore";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ReplyIcon from "@mui/icons-material/Reply";

const statusOptions = ["new", "in_progress", "replied", "closed"];

export default function Messages() {
  const { user } = useAuthStore();
  const canManageContacts =
    user?.role === "superadmin" ||
    user?.permissions?.includes("manage_contacts");

  const {
    contacts,
    currentContact,
    fetchContacts,
    fetchContact,
    updateContactStatus,
    replyToContact,
    isLoading,
  } = useAdminStore();

  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (canManageContacts) {
      fetchContacts().catch(() => {});
    }
  }, [canManageContacts]);

  useEffect(() => {
    if (selectedId) {
      fetchContact(selectedId).catch(() => {});
    }
  }, [selectedId]);

  const selectedContact = useMemo(() => {
    if (currentContact?._id === selectedId) return currentContact;
    return contacts.find((c) => c._id === selectedId) || null;
  }, [contacts, currentContact, selectedId]);

  const handleStatusChange = async (status) => {
    if (!selectedContact) return;
    try {
      await updateContactStatus(selectedContact._id, status);
      toast.success("Status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!selectedContact || !replyText.trim()) return;
    try {
      await replyToContact(selectedContact._id, replyText.trim());
      setReplyText("");
      toast.success("Reply sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reply");
    }
  };

  if (!canManageContacts) {
    return (
      <div className="card">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Messages</h1>
        <p className="text-gray-600">
          You do not have permission to view or reply to contact submissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-gray-600">Review submissions and reply to users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1 p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Inbox</h2>
          </div>
          {isLoading ? (
            <div className="p-6 flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No contact messages yet.
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-auto divide-y divide-gray-100">
              {contacts.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => setSelectedId(contact._id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedId === contact._id ? "bg-primary-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900 truncate">
                      {contact.subject}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                      {contact.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {contact.name} • {contact.email}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card lg:col-span-2">
          {!selectedContact ? (
            <div className="h-full min-h-[280px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MailOutlineIcon
                  className="text-gray-300"
                  style={{ fontSize: 48 }}
                />
                <p>Select a message to view details</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedContact.subject}
                  </h2>
                  <p className="text-sm text-gray-600">
                    From {selectedContact.name} ({selectedContact.email})
                  </p>
                </div>
                <select
                  value={selectedContact.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="input-field sm:w-52"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedContact.message}
                </p>
              </div>

              {selectedContact.replies?.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Replies</h3>
                  {selectedContact.replies.map((reply) => (
                    <div key={reply._id} className="bg-blue-50 rounded-xl p-3">
                      <p className="text-sm text-blue-900 whitespace-pre-wrap">
                        {reply.message}
                      </p>
                      <p className="text-xs text-blue-700 mt-2">
                        {reply.admin?.name || "Admin"} •{" "}
                        {new Date(reply.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <form
                onSubmit={handleReply}
                className="space-y-3 pt-2 border-t border-gray-100"
              >
                <label className="block text-sm font-medium text-gray-700">
                  Reply
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  required
                />
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center"
                >
                  <ReplyIcon className="mr-2" fontSize="small" /> Send Reply
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
