import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useNoteStore } from "../../store";
import toast from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import NoteIcon from "@mui/icons-material/Note";
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
  const [searchParams] = useSearchParams();
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
    createSemester,
    createSubject,
    isLoading,
  } = useNoteStore();

  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
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
        String(note.semester?._id || note.semester) === String(selectedSemesterId);
      const subjectMatch =
        String(note.subject?._id || note.subject) === String(selectedSubjectId);
      const text = `${note.title} ${note.subject?.name || ""}`.toLowerCase();
      const searchMatch = text.includes(search.trim().toLowerCase());
      return semesterMatch && subjectMatch && searchMatch;
    });
  }, [notes, search, selectedSemesterId, selectedSubjectId]);

  useEffect(() => {
    const initialize = async () => {
      setIsInitializing(true);
      try {
        if (institutions.length === 0) {
          await fetchInstitutions();
        }

        const loadedSemesters = await fetchSemesters(institutionId);
        const semesterFromQuery = searchParams.get("semester");
        const firstSemester = loadedSemesters?.find(
          (semester) => String(semester._id) === String(semesterFromQuery),
        ) || loadedSemesters?.[0];

        if (!firstSemester) {
          setSelectedSemesterId("");
          setSelectedSubjectId("");
          setIsInitializing(false);
          return;
        }

        const semesterId = firstSemester._id;
        setSelectedSemesterId(semesterId);

        const loadedSubjects = await fetchSubjects(semesterId);
        const subjectFromQuery = searchParams.get("subject");
        const firstSubject = loadedSubjects?.find(
          (subject) => String(subject._id) === String(subjectFromQuery),
        ) || loadedSubjects?.[0];

        if (firstSubject) {
          setSelectedSubjectId(firstSubject._id);
          await fetchNotes({ subjectId: firstSubject._id });
        } else {
          setSelectedSubjectId("");
        }
      } catch (error) {
        toast.error("Failed to load institution content");
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [institutionId, searchParams]);

  const handleSemesterChange = async (semesterId) => {
    setSelectedSemesterId(semesterId);
    setSelectedSubjectId("");

    if (!semesterId) {
      return;
    }

    try {
      const loadedSubjects = await fetchSubjects(semesterId);
      const firstSubject = loadedSubjects?.[0];

      if (firstSubject) {
        setSelectedSubjectId(firstSubject._id);
        await fetchNotes({ subjectId: firstSubject._id });
      } else {
        setSelectedSubjectId("");
      }
    } catch (error) {
      toast.error("Failed to load subjects");
    }
  };

  const handleSubjectChange = async (subjectId) => {
    setSelectedSubjectId(subjectId);

    if (!subjectId) {
      return;
    }

    try {
      await fetchNotes({ subjectId });
    } catch (error) {
      toast.error("Failed to load notes");
    }
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
      navigate(`/notes/${note._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create note");
    }
  };

  const handleCreateSemester = async (e) => {
    e.preventDefault();

    try {
      const createdSemester = await createSemester({
        ...semesterForm,
        institutionId,
      });
      await fetchSemesters(institutionId);
      setSelectedSemesterId(createdSemester._id);

      const loadedSubjects = await fetchSubjects(createdSemester._id);
      const firstSubject = loadedSubjects?.[0];
      if (firstSubject) {
        setSelectedSubjectId(firstSubject._id);
        await fetchNotes({ subjectId: firstSubject._id });
      } else {
        setSelectedSubjectId("");
      }

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
      await fetchSubjects(selectedSemesterId);
      setSelectedSubjectId(createdSubject._id);
      await fetchNotes({ subjectId: createdSubject._id });

      setSubjectModalOpen(false);
      setSubjectForm({ name: "", code: "", description: "", instructor: "" });
      toast.success("Subject added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create subject");
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {institution?.name || "Institution"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Semester
            </label>
            <select
              value={selectedSemesterId}
              onChange={(e) => handleSemesterChange(e.target.value)}
              className="input-field"
            >
              <option value="">Select semester</option>
              {institutionSemesters.map((semester) => (
                <option key={semester._id} value={semester._id}>
                  {semester.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="input-field"
              disabled={!selectedSemesterId || semesterSubjects.length === 0}
            >
              <option value="">Select subject</option>
              {semesterSubjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-56">
          <div className="spinner" />
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Link
              key={note._id}
              to={`/notes/${note._id}`}
              className="card hover:shadow-lg transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: note.subject?.color || "#667eea" }}
              >
                <NoteIcon className="text-white" fontSize="small" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
                {note.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {note.subject?.name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Updated {format(new Date(note.updatedAt), "MMM d, yyyy")}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card text-center py-14">
          <NoteIcon className="text-gray-300 dark:text-gray-600 mb-4" style={{ fontSize: 56 }} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No notes found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedSubjectId
              ? "Create your first note for this subject."
              : "Select a subject to view notes."}
          </p>
        </div>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
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

      <Dialog open={semesterModalOpen} onClose={() => setSemesterModalOpen(false)} maxWidth="sm" fullWidth>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={semesterForm.description}
                onChange={(e) =>
                  setSemesterForm((prev) => ({ ...prev, description: e.target.value }))
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

      <Dialog open={subjectModalOpen} onClose={() => setSubjectModalOpen(false)} maxWidth="sm" fullWidth>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code (Optional)
                </label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) =>
                    setSubjectForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                  className="input-field"
                  placeholder="e.g., CS301"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructor (Optional)
                </label>
                <input
                  type="text"
                  value={subjectForm.instructor}
                  onChange={(e) =>
                    setSubjectForm((prev) => ({ ...prev, instructor: e.target.value }))
                  }
                  className="input-field"
                  placeholder="e.g., Dr. Ahmed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={subjectForm.description}
                onChange={(e) =>
                  setSubjectForm((prev) => ({ ...prev, description: e.target.value }))
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
    </div>
  );
}
