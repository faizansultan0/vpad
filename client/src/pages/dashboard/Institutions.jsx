import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNoteStore } from "../../store";
import toast from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";

const institutionTypes = [
  { value: "school", label: "School" },
  { value: "college", label: "College" },
  { value: "university", label: "University" },
  { value: "other", label: "Other" },
];

const colors = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#f5576c",
  "#4facfe",
  "#00f2fe",
  "#43e97b",
  "#fa709a",
];

export default function Institutions() {
  const {
    institutions,
    fetchInstitutions,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    isLoading,
  } = useNoteStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "university",
    description: "",
    color: "#667eea",
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const openModal = (institution = null) => {
    if (institution) {
      setEditingInstitution(institution);
      setFormData({
        name: institution.name,
        type: institution.type,
        description: institution.description || "",
        color: institution.color || "#667eea",
      });
    } else {
      setEditingInstitution(null);
      setFormData({
        name: "",
        type: "university",
        description: "",
        color: "#667eea",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInstitution) {
        await updateInstitution(editingInstitution._id, formData);
        toast.success("Institution updated");
      } else {
        await createInstitution(formData);
        toast.success("Institution created");
      }
      setModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInstitution(deleteConfirm._id);
      toast.success("Institution deleted");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutions</h1>
          <p className="text-gray-600">
            Manage your schools, colleges, and universities
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center"
        >
          <AddIcon className="mr-1" /> Add Institution
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : institutions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {institutions.map((inst, index) => (
              <motion.div
                key={inst._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="card group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: inst.color || "#667eea" }}
                  >
                    <SchoolIcon className="text-white" fontSize="large" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button
                      onClick={() => openModal(inst)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Edit"
                    >
                      <EditIcon fontSize="small" className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(inst)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <DeleteIcon fontSize="small" className="text-red-500" />
                    </button>
                  </div>
                </div>
                <Link to={`/institutions/${inst._id}/semesters`}>
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                    {inst.name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize mb-2">
                    {inst.type}
                  </p>
                  {inst.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {inst.description}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <span>{inst.semesterCount || 0} Semesters</span>
                    <span className="text-primary-600">View →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card text-center py-16">
          <SchoolIcon className="text-gray-300 mb-4" style={{ fontSize: 64 }} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Institutions Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first institution to get started organizing your notes
          </p>
          <button
            onClick={() => openModal()}
            className="btn-primary inline-flex items-center"
          >
            <AddIcon className="mr-1" /> Add Institution
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
              {editingInstitution ? "Edit Institution" : "Add Institution"}
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
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-field"
                placeholder="e.g., Harvard University"
                required
              />
            </div>
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
                {institutionTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input-field"
                rows={3}
                placeholder="Brief description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-lg transition-transform ${
                      formData.color === color
                        ? "ring-2 ring-offset-2 ring-primary-500 scale-110"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
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
                {editingInstitution ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        fullWidth
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <DeleteIcon className="text-red-600" fontSize="large" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Delete Institution?
          </h3>
          <p className="text-gray-600 mb-6">
            This will archive all semesters, subjects, and notes under "
            {deleteConfirm?.name}". This action cannot be undone.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
