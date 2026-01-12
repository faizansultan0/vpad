import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNoteStore } from "../../store";
import toast from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import NoteIcon from "@mui/icons-material/Note";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PushPinIcon from "@mui/icons-material/PushPin";
import StarIcon from "@mui/icons-material/Star";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import { format } from "date-fns";

export default function Notes() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const {
    subjects,
    notes,
    fetchSubjects,
    fetchNotes,
    createNote,
    deleteNote,
    isLoading,
  } = useNoteStore();
  const [subject, setSubject] = useState(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ title: "" });

  useEffect(() => {
    const load = async () => {
      if (subjects.length === 0) await fetchSubjects();
      await fetchNotes({ subjectId });
    };
    load();
  }, [subjectId]);

  useEffect(() => {
    const sub = subjects.find((s) => s._id === subjectId);
    setSubject(sub);
  }, [subjects, subjectId]);

  const filteredNotes = notes
    .filter((n) => n.subject?._id === subjectId || n.subject === subjectId)
    .filter((n) => n.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const note = await createNote({ ...formData, subjectId });
      toast.success("Note created");
      setModalOpen(false);
      navigate(`/notes/${note._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create note");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote(deleteConfirm._id);
      toast.success("Note deleted");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <Link
            to={
              subject?.semester
                ? `/semesters/${
                    subject.semester._id || subject.semester
                  }/subjects`
                : "/institutions"
            }
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowBackIcon />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {subject?.name || "Loading..."}
            </h1>
            <p className="text-gray-600">
              {subject?.code && `${subject.code} • `}Your notes for this subject
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setFormData({ title: "" });
            setModalOpen(true);
          }}
          className="btn-primary flex items-center"
        >
          <AddIcon className="mr-1" /> New Note
        </button>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
          placeholder="Search notes..."
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.03 }}
                className="card group relative"
              >
                <div className="absolute top-4 right-4 flex items-center space-x-1">
                  {note.isPinned && (
                    <PushPinIcon
                      fontSize="small"
                      className="text-primary-500"
                    />
                  )}
                  {note.isFavorite && (
                    <StarIcon fontSize="small" className="text-yellow-500" />
                  )}
                </div>
                <Link to={`/notes/${note._id}`} className="block">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: subject?.color || "#667eea" }}
                  >
                    <NoteIcon className="text-white" fontSize="small" />
                  </div>
                  <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                    {note.title}
                  </h3>
                  {note.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {format(new Date(note.updatedAt), "MMM d, yyyy")}
                  </p>
                </Link>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                  <Link
                    to={`/notes/${note._id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <EditIcon fontSize="small" className="text-gray-500" />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(note)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <DeleteIcon fontSize="small" className="text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card text-center py-16">
          <NoteIcon className="text-gray-300 mb-4" style={{ fontSize: 64 }} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {search ? "No Notes Found" : "No Notes Yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {search
              ? "Try a different search term"
              : "Create your first note to get started"}
          </p>
          {!search && (
            <button
              onClick={() => {
                setFormData({ title: "" });
                setModalOpen(true);
              }}
              className="btn-primary inline-flex items-center"
            >
              <AddIcon className="mr-1" /> New Note
            </button>
          )}
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
            <h2 className="text-xl font-semibold">Create New Note</h2>
            <button
              onClick={() => setModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <CloseIcon />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input-field"
                placeholder="e.g., Chapter 1 - Introduction"
                required
                autoFocus
              />
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
                Create & Edit
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
            Delete Note?
          </h3>
          <p className="text-gray-600 mb-6">
            "{deleteConfirm?.title}" will be moved to archive.
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
