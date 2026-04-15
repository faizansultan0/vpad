import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNoteStore } from "../../store";
import toast from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";

const colors = [
  "#f093fb",
  "#667eea",
  "#764ba2",
  "#f5576c",
  "#4facfe",
  "#00f2fe",
  "#43e97b",
  "#fa709a",
];

export default function Subjects() {
  const { semesterId } = useParams();
  const {
    semesters,
    subjects,
    fetchSemesters,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    isLoading,
  } = useNoteStore();
  const [semester, setSemester] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    instructor: "",
    color: "#f093fb",
  });
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true);
      if (semesters.length === 0) await fetchSemesters();
      await fetchSubjects(semesterId);
      setInitialLoading(false);
    };
    load();
  }, [semesterId]);

  useEffect(() => {
    const sem = semesters.find((s) => s._id === semesterId);
    setSemester(sem);
  }, [semesters, semesterId]);

  const filteredSubjects = subjects.filter(
    (s) => s.semester?._id === semesterId || s.semester === semesterId,
  );

  const openModal = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code || "",
        description: subject.description || "",
        instructor: subject.instructor || "",
        color: subject.color || "#f093fb",
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        instructor: "",
        color: "#f093fb",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await updateSubject(editingSubject._id, formData);
        toast.success("Subject renamed");
      } else {
        await createSubject({ ...formData, semesterId });
        toast.success("Subject created");
      }
      setModalOpen(false);
      fetchSubjects(semesterId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubject(deleteConfirm._id);
      toast.success("Subject deleted");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <Link
          to={
            semester?.institution
              ? `/institutions/${
                  semester.institution._id || semester.institution
                }/content?semester=${semesterId}`
              : "/institutions"
          }
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowBackIcon />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {semester?.name || "Loading..."}
          </h1>
          <p className="text-gray-600">Manage your subjects and courses</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center"
        >
          <AddIcon className="mr-1" /> Add Subject
        </button>
      </div>

      {isLoading || initialLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredSubjects.map((sub, index) => (
              <motion.div
                key={sub._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="card group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: sub.color || "#f093fb" }}
                  >
                    <MenuBookIcon className="text-white" fontSize="large" />
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openModal(sub)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Rename subject"
                    >
                      <EditIcon fontSize="small" className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(sub)}
                      className="p-2 hover:bg-red-50 rounded-lg"
                    >
                      <DeleteIcon fontSize="small" className="text-red-500" />
                    </button>
                  </div>
                </div>
                <Link
                  to={`/institutions/${
                    semester?.institution?._id || semester?.institution
                  }/content?semester=${semesterId}&subject=${sub._id}`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                    {sub.name}
                  </h3>
                  {sub.code && (
                    <p className="text-sm text-primary-600 font-mono mb-1">
                      {sub.code}
                    </p>
                  )}
                  {sub.instructor && (
                    <p className="text-sm text-gray-500 mb-2">
                      Instructor: {sub.instructor}
                    </p>
                  )}
                  {sub.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {sub.description}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <span>{sub.noteCount || 0} Notes</span>
                    <span className="text-primary-600">Open →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card text-center py-16">
          <MenuBookIcon
            className="text-gray-300 mb-4"
            style={{ fontSize: 64 }}
          />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Subjects Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first subject to start creating notes
          </p>
          <button
            onClick={() => openModal()}
            className="btn-primary inline-flex items-center"
          >
            <AddIcon className="mr-1" /> Add Subject
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
              {editingSubject ? "Rename Subject" : "Add Subject"}
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
                Subject Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-field"
                placeholder="e.g., Data Structures"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., CS201"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructor (Optional)
                </label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) =>
                    setFormData({ ...formData, instructor: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., Dr. Smith"
                />
              </div>
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
                {editingSubject ? "Save Rename" : "Create"}
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
            Delete Subject?
          </h3>
          <p className="text-gray-600 mb-6">
            This will archive all notes under "{deleteConfirm?.name}".
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
