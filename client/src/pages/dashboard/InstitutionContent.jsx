import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
  Link,
  useSearchParams,
} from "react-router-dom";
import { motion } from "framer-motion";
import { useNoteStore } from "../../store";
import toast from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import NoteIcon from "@mui/icons-material/Note";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PushPinIcon from "@mui/icons-material/PushPin";
import StarIcon from "@mui/icons-material/Star";
import SearchIcon from "@mui/icons-material/Search";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import { format } from "date-fns";

const semesterTypes = [
  { value: "semester", label: "Semester" },
  { value: "year", label: "Year" },
  { value: "term", label: "Term" },
  { value: "quarter", label: "Quarter" },
];

export default function InstitutionContent() {
  const { institutionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    institutions,
    semesters,
    subjects,
    notes,
    fetchInstitutions,
    fetchSemesters,
    fetchSubjects,
    fetchNotes,
    createNote,
    deleteNote,
    createSemester,
    createSubject,
    updateSemester,
    updateSubject,
    fetchNoteForDownload,
    downloadNoteAsPdf,
  } = useNoteStore();

  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isNotesLoading, setIsNotesLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [downloadingNoteId, setDownloadingNoteId] = useState(null);
  const [semesterModalOpen, setSemesterModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [semesterForm, setSemesterForm] = useState({
    name: "",
    type: "semester",
    description: "",
  });
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    code: "",
    description: "",
    instructor: "",
  });
  const [editSemesterModalOpen, setEditSemesterModalOpen] = useState(false);
  const [editSubjectModalOpen, setEditSubjectModalOpen] = useState(false);
  const [editSemesterForm, setEditSemesterForm] = useState({
    name: "",
    type: "semester",
    description: "",
  });
  const [editSubjectForm, setEditSubjectForm] = useState({
    name: "",
    code: "",
    description: "",
    instructor: "",
  });

  const institution = useMemo(
    () => institutions.find((item) => item._id === institutionId),
    [institutions, institutionId],
  );

  const institutionSemesters = useMemo(
    () =>
      semesters.filter(
        (semester) =>
          String(semester.institution?._id || semester.institution) ===
          String(institutionId),
      ),
    [semesters, institutionId],
  );

  const semesterSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) =>
          String(subject.semester?._id || subject.semester) ===
          String(selectedSemesterId),
      ),
    [subjects, selectedSemesterId],
  );

  const filteredNotes = useMemo(() => {
    if (!selectedSemesterId || !selectedSubjectId) {
      return [];
    }

    return notes.filter((note) => {
      const semesterMatch =
        String(note.semester?._id || note.semester) ===
        String(selectedSemesterId);
      const subjectMatch =
        String(note.subject?._id || note.subject) === String(selectedSubjectId);
      const text = `${note.title} ${note.subject?.name || ""}`.toLowerCase();
      const searchMatch = text.includes(search.trim().toLowerCase());
      return semesterMatch && subjectMatch && searchMatch;
    });
  }, [notes, search, selectedSemesterId, selectedSubjectId]);

  const buildContentPath = (semesterId, subjectId) => {
    if (!institutionId) {
      return "/institutions";
    }

    const params = new URLSearchParams();
    if (semesterId) {
      params.set("semester", String(semesterId));
    }
    if (subjectId) {
      params.set("subject", String(subjectId));
    }

    const query = params.toString();
    return `/institutions/${institutionId}/content${query ? `?${query}` : ""}`;
  };

  const syncFiltersToUrl = (semesterId, subjectId) => {
    const next = new URLSearchParams(searchParams);

    if (semesterId) {
      next.set("semester", String(semesterId));
    } else {
      next.delete("semester");
    }

    if (subjectId) {
      next.set("subject", String(subjectId));
    } else {
      next.delete("subject");
    }

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setIsInitializing(true);
      setIsNotesLoading(true);
      try {
        if (institutions.length === 0) {
          await fetchInstitutions();
        }

        const [loadedSemesters, loadedSubjects] = await Promise.all([
          fetchSemesters(institutionId),
          fetchSubjects({ institutionId }),
          fetchNotes({ institutionId, limit: 1000 }),
        ]);

        const semesterFromQuery = searchParams.get("semester");
        const firstSemester =
          loadedSemesters?.find(
            (semester) => String(semester._id) === String(semesterFromQuery),
          ) || loadedSemesters?.[0];

        if (!firstSemester) {
          setSelectedSemesterId("");
          setSelectedSubjectId("");
          syncFiltersToUrl("", "");
          setIsInitializing(false);
          return;
        }

        const semesterId = firstSemester._id;
        setSelectedSemesterId(semesterId);

        const subjectsForSemester = (loadedSubjects || []).filter(
          (subject) =>
            String(subject.semester?._id || subject.semester) ===
            String(semesterId),
        );
        const subjectFromQuery = searchParams.get("subject");
        const firstSubject =
          subjectsForSemester.find(
            (subject) => String(subject._id) === String(subjectFromQuery),
          ) || subjectsForSemester[0];

        if (firstSubject) {
          setSelectedSubjectId(firstSubject._id);
          syncFiltersToUrl(semesterId, firstSubject._id);
        } else {
          setSelectedSubjectId("");
          syncFiltersToUrl(semesterId, "");
        }
      } catch (error) {
        toast.error("Failed to load institution content");
      } finally {
        setIsNotesLoading(false);
        setIsInitializing(false);
      }
    };

    initialize();
  }, [institutionId]);

  const handleSemesterChange = (semesterId) => {
    setSelectedSemesterId(semesterId);
    setSelectedSubjectId("");

    if (!semesterId) {
      syncFiltersToUrl("", "");
      return;
    }

    const subjectsForSemester = subjects.filter(
      (subject) =>
        String(subject.semester?._id || subject.semester) === String(semesterId),
    );
    const firstSubject = subjectsForSemester[0];

    if (firstSubject) {
      setSelectedSubjectId(firstSubject._id);
      syncFiltersToUrl(semesterId, firstSubject._id);
    } else {
      setSelectedSubjectId("");
      syncFiltersToUrl(semesterId, "");
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubjectId(subjectId);

    if (!subjectId) {
      syncFiltersToUrl(selectedSemesterId, "");
      return;
    }

    syncFiltersToUrl(selectedSemesterId, subjectId);
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();

    if (!selectedSubjectId) {
      toast.error("Please select a subject first");
      return;
    }

    try {
      const note = await createNote({
        subjectId: selectedSubjectId,
        title: newNoteTitle,
      });
      setModalOpen(false);
      setNewNoteTitle("");
      toast.success("Note created");
      navigate(`/notes/${note._id}`, {
        state: {
          returnTo: buildContentPath(selectedSemesterId, selectedSubjectId),
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create note");
    }
  };

  const handleDownloadNote = async (event, noteId) => {
    event.preventDefault();
    event.stopPropagation();

    if (!noteId || downloadingNoteId) return;

    setDownloadingNoteId(noteId);
    try {
      const fullNote = await fetchNoteForDownload(noteId);
      await downloadNoteAsPdf(fullNote);
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download note");
    } finally {
      setDownloadingNoteId(null);
    }
  };

  const handleDeleteNote = async () => {
    try {
      await deleteNote(deleteConfirm._id);
      toast.success("Note deleted");
      setDeleteConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const selectedContentPath = buildContentPath(
    selectedSemesterId,
    selectedSubjectId,
  );

  const handleCreateSemester = async (e) => {
    e.preventDefault();

    try {
      const createdSemester = await createSemester({
        ...semesterForm,
        institutionId,
      });
      setSelectedSemesterId(createdSemester._id);
      setSelectedSubjectId("");
      syncFiltersToUrl(createdSemester._id, "");

      setSemesterModalOpen(false);
      setSemesterForm({ name: "", type: "semester", description: "" });
      toast.success("Semester added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create semester");
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();

    if (!selectedSemesterId) {
      toast.error("Please select a semester first");
      return;
    }

    try {
      const createdSubject = await createSubject({
        ...subjectForm,
        semesterId: selectedSemesterId,
      });
      setSelectedSubjectId(createdSubject._id);
      syncFiltersToUrl(selectedSemesterId, createdSubject._id);

      setSubjectModalOpen(false);
      setSubjectForm({ name: "", code: "", description: "", instructor: "" });
      toast.success("Subject added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create subject");
    }
  };

  const openEditSemesterModal = () => {
    const sem = institutionSemesters.find((s) => String(s._id) === String(selectedSemesterId));
    if (sem) {
      setEditSemesterForm({
        name: sem.name,
        type: sem.type || "semester",
        description: sem.description || "",
      });
      setEditSemesterModalOpen(true);
    }
  };

  const openEditSubjectModal = () => {
    const sub = semesterSubjects.find((s) => String(s._id) === String(selectedSubjectId));
    if (sub) {
      setEditSubjectForm({
        name: sub.name,
        code: sub.code || "",
        description: sub.description || "",
        instructor: sub.instructor || "",
      });
      setEditSubjectModalOpen(true);
    }
  };

  const handleUpdateSemester = async (e) => {
    e.preventDefault();
    try {
      await updateSemester(selectedSemesterId, editSemesterForm);
      setEditSemesterModalOpen(false);
      toast.success("Semester updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update semester");
    }
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    try {
      await updateSubject(selectedSubjectId, editSubjectForm);
      setEditSubjectModalOpen(false);
      toast.success("Subject updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update subject");
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center space-x-3 flex-1">
          <Link
            to="/institutions"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowBackIcon />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {institution?.name || "Institution"}
            </h1>
            <p className="text-gray-400">
              Pick a semester and subject to jump to notes quickly.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSemesterModalOpen(true)}
            className="btn-secondary inline-flex items-center"
          >
            <CalendarMonthIcon className="mr-1" fontSize="small" /> Add Semester
          </button>
          <button
            onClick={() => setSubjectModalOpen(true)}
            className="btn-secondary inline-flex items-center"
            disabled={!selectedSemesterId}
          >
            <MenuBookIcon className="mr-1" fontSize="small" /> Add Subject
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary inline-flex items-center"
            disabled={!selectedSubjectId}
          >
            <AddIcon className="mr-1" /> New Note
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Semester
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedSemesterId}
                onChange={(e) => handleSemesterChange(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">Select semester</option>
                {institutionSemesters.map((semester) => (
                  <option key={semester._id} value={semester._id}>
                    {semester.name}
                  </option>
                ))}
              </select>
              {selectedSemesterId && (
                <button
                  onClick={openEditSemesterModal}
                  className="p-2 rounded-lg hover:bg-dark-hover transition-colors"
                  title="Edit semester"
                >
                  <EditIcon fontSize="small" className="text-gray-400 hover:text-primary-400" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectId}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="input-field flex-1"
                disabled={!selectedSemesterId || semesterSubjects.length === 0}
              >
                <option value="">Select subject</option>
                {semesterSubjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {selectedSubjectId && (
                <button
                  onClick={openEditSubjectModal}
                  className="p-2 rounded-lg hover:bg-dark-hover transition-colors"
                  title="Edit subject"
                >
                  <EditIcon fontSize="small" className="text-gray-400 hover:text-primary-400" />
                </button>
              )}
            </div>
          </div>
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
      </motion.div>

      {isNotesLoading ? (
        <div className="flex items-center justify-center h-56">
          <div className="spinner" />
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="card group relative hover:shadow-lg transition-shadow"
            >
              <div className="absolute top-4 right-4 flex items-center space-x-1">
                {note.isPinned && (
                  <PushPinIcon fontSize="small" className="text-primary-500" />
                )}
                {note.isFavorite && (
                  <StarIcon fontSize="small" className="text-yellow-500" />
                )}
              </div>
              <Link
                to={`/notes/${note._id}`}
                state={{ returnTo: selectedContentPath }}
                className="block"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: note.subject?.color || "#667eea" }}
                >
                  <NoteIcon className="text-white" fontSize="small" />
                </div>
                <h3 className="font-semibold text-white line-clamp-2 mb-2">
                  {note.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {note.subject?.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Updated {format(new Date(note.updatedAt), "MMM d, yyyy")}
                </p>
              </Link>
              <div className="absolute bottom-4 right-4 flex space-x-1">
                <button
                  type="button"
                  onClick={(event) => handleDownloadNote(event, note._id)}
                  disabled={downloadingNoteId === note._id}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download note"
                >
                  <DownloadIcon fontSize="small" className="text-gray-400" />
                </button>
                <Link
                  to={`/notes/${note._id}`}
                  state={{ returnTo: selectedContentPath }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  title="Open note"
                >
                  <EditIcon fontSize="small" className="text-gray-400" />
                </Link>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setDeleteConfirm(note);
                  }}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  title="Delete note"
                >
                  <DeleteIcon fontSize="small" className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-14">
          <NoteIcon
            className="text-gray-600 mb-4"
            style={{ fontSize: 56 }}
          />
          <h3 className="text-xl font-semibold text-white mb-2">
            No notes found
          </h3>
          <p className="text-gray-400">
            {selectedSubjectId
              ? "Create your first note for this subject."
              : "Select a subject to view notes."}
          </p>
        </div>
      )}

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
          <h3 className="text-lg font-semibold text-white mb-2">
            Delete Note?
          </h3>
          <p className="text-gray-400 mb-6">
            &quot;{deleteConfirm?.title}&quot; will be moved to archive.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteNote}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Create New Note</h2>
            <button
              onClick={() => setModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <CloseIcon />
            </button>
          </div>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              className="input-field"
              placeholder="e.g., Chapter 1 - Introduction"
              required
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      <Dialog
        open={semesterModalOpen}
        onClose={() => setSemesterModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add Semester</h2>
            <button
              onClick={() => setSemesterModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={handleCreateSemester} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={semesterForm.name}
                onChange={(e) =>
                  setSemesterForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input-field"
                placeholder="e.g., Fall 2026"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={semesterForm.type}
                onChange={(e) =>
                  setSemesterForm((prev) => ({ ...prev, type: e.target.value }))
                }
                className="input-field"
              >
                {semesterTypes.map((typeOption) => (
                  <option key={typeOption.value} value={typeOption.value}>
                    {typeOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={semesterForm.description}
                onChange={(e) =>
                  setSemesterForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="input-field resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSemesterModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Semester
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      <Dialog
        open={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Add Subject</h2>
            <button
              onClick={() => setSubjectModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={handleCreateSubject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject Name
              </label>
              <input
                type="text"
                value={subjectForm.name}
                onChange={(e) =>
                  setSubjectForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input-field"
                placeholder="e.g., Data Structures"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Code (Optional)
                </label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) =>
                    setSubjectForm((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  className="input-field"
                  placeholder="e.g., CS301"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instructor (Optional)
                </label>
                <input
                  type="text"
                  value={subjectForm.instructor}
                  onChange={(e) =>
                    setSubjectForm((prev) => ({
                      ...prev,
                      instructor: e.target.value,
                    }))
                  }
                  className="input-field"
                  placeholder="e.g., Dr. Ahmed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={subjectForm.description}
                onChange={(e) =>
                  setSubjectForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="input-field resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubjectModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Subject
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Edit Semester Modal */}
      <Dialog
        open={editSemesterModalOpen}
        onClose={() => setEditSemesterModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Edit Semester</h2>
            <button
              onClick={() => setEditSemesterModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={handleUpdateSemester} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={editSemesterForm.name}
                onChange={(e) =>
                  setEditSemesterForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={editSemesterForm.type}
                onChange={(e) =>
                  setEditSemesterForm((prev) => ({ ...prev, type: e.target.value }))
                }
                className="input-field"
              >
                {semesterTypes.map((typeOption) => (
                  <option key={typeOption.value} value={typeOption.value}>
                    {typeOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={editSemesterForm.description}
                onChange={(e) =>
                  setEditSemesterForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="input-field resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditSemesterModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog
        open={editSubjectModalOpen}
        onClose={() => setEditSubjectModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Edit Subject</h2>
            <button
              onClick={() => setEditSubjectModalOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <CloseIcon />
            </button>
          </div>

          <form onSubmit={handleUpdateSubject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subject Name
              </label>
              <input
                type="text"
                value={editSubjectForm.name}
                onChange={(e) =>
                  setEditSubjectForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input-field"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Code (Optional)
                </label>
                <input
                  type="text"
                  value={editSubjectForm.code}
                  onChange={(e) =>
                    setEditSubjectForm((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instructor (Optional)
                </label>
                <input
                  type="text"
                  value={editSubjectForm.instructor}
                  onChange={(e) =>
                    setEditSubjectForm((prev) => ({
                      ...prev,
                      instructor: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={editSubjectForm.description}
                onChange={(e) =>
                  setEditSubjectForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="input-field resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditSubjectModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
