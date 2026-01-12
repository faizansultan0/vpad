import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useNoteStore, useSocketStore, useAuthStore } from "../../store";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Link2 from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import toast from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import QuizIcon from "@mui/icons-material/Quiz";
import ImageIcon from "@mui/icons-material/Image";
import PushPinIcon from "@mui/icons-material/PushPin";
import StarIcon from "@mui/icons-material/Star";
import Avatar from "@mui/material/Avatar";
import AvatarGroup from "@mui/material/AvatarGroup";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";

const MenuButton = ({ onClick, active, disabled, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      active
        ? "bg-primary-100 text-primary-600"
        : "hover:bg-gray-100 text-gray-600"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

export default function NoteEditor() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();
  const {
    currentNote,
    fetchNote,
    updateNote,
    shareNote,
    summarizeNote,
    generateQuiz,
    uploadAttachment,
  } = useNoteStore();
  const { connect, joinNote, leaveNote, activeUsers, on, off, emitNoteChange } =
    useSocketStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("view");
  const [summaryModal, setSummaryModal] = useState(false);
  const [summary, setSummary] = useState("");
  const [quizModal, setQuizModal] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const fetchedRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing your notes..." }),
      Highlight,
      Link2.configure({ openOnClick: false }),
      Image,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setHasChanges(true);
      emitNoteChange(noteId, editor.getHTML(), null);
    },
  });

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const load = async () => {
      try {
        const note = await fetchNote(noteId);
        setTitle(note.title);
        editor?.commands.setContent(note.content || "");
        setIsLoading(false);

        if (accessToken) {
          connect(accessToken);
          joinNote(noteId);
        }
      } catch (error) {
        toast.error("Failed to load note");
        navigate(-1);
      }
    };
    load();

    return () => {
      leaveNote(noteId);
    };
  }, [noteId]);

  useEffect(() => {
    const handleNoteChange = (data) => {
      if (data.user._id !== user?._id && editor) {
        const { from, to } = editor.state.selection;
        editor.commands.setContent(data.changes, false);
        editor.commands.setTextSelection({ from, to });
      }
    };

    on("noteChange", handleNoteChange);
    return () => off("noteChange", handleNoteChange);
  }, [editor, user]);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
      await updateNote(noteId, { title, content: editor?.getHTML() });
      setHasChanges(false);
      toast.success("Saved");
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [noteId, title, editor, hasChanges]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (hasChanges) handleSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [hasChanges, handleSave]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      await shareNote(noteId, shareEmail, sharePermission);
      toast.success("Note shared successfully");
      setShareModal(false);
      setShareEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share");
    }
  };

  const handleSummarize = async () => {
    setAiLoading(true);
    try {
      const result = await summarizeNote(noteId);
      setSummary(result.text);
      setSummaryModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to summarize");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setAiLoading(true);
    try {
      const result = await generateQuiz(noteId, {
        questionCount: 5,
        difficulty: "medium",
      });
      setQuiz(result);
      setQuizModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate quiz");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const attachment = await uploadAttachment(noteId, file, "image");
          editor?.chain().focus().setImage({ src: attachment.url }).run();
          toast.success("Image uploaded");
        } catch (error) {
          toast.error("Failed to upload image");
        }
      }
    };
    input.click();
  };

  const togglePin = async () => {
    await updateNote(noteId, { isPinned: !currentNote?.isPinned });
    toast.success(currentNote?.isPinned ? "Unpinned" : "Pinned");
  };

  const toggleFavorite = async () => {
    await updateNote(noteId, { isFavorite: !currentNote?.isFavorite });
    toast.success(
      currentNote?.isFavorite ? "Removed from favorites" : "Added to favorites"
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              if (hasChanges) handleSave();
              navigate(-1);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowBackIcon />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasChanges(true);
            }}
            className="text-xl font-semibold bg-transparent border-none outline-none focus:ring-0 w-full max-w-md"
            placeholder="Note title"
          />
        </div>
        <div className="flex items-center space-x-2">
          {activeUsers.length > 0 && (
            <AvatarGroup max={3} className="mr-2">
              {activeUsers.map((u) => (
                <Avatar
                  key={u._id}
                  src={u.profilePicture?.url}
                  alt={u.name}
                  sx={{ width: 28, height: 28 }}
                >
                  {u.name?.charAt(0)}
                </Avatar>
              ))}
            </AvatarGroup>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="btn-primary flex items-center text-sm py-2 disabled:opacity-50"
          >
            <SaveIcon fontSize="small" className="mr-1" />{" "}
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setShareModal(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Share"
          >
            <ShareIcon />
          </button>
          <button
            onClick={(e) => setAnchorEl(e.currentTarget)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertIcon />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-1 py-2 border-b border-gray-100 overflow-x-auto">
        <MenuButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <FormatBoldIcon fontSize="small" />
        </MenuButton>
        <MenuButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <FormatItalicIcon fontSize="small" />
        </MenuButton>
        <MenuButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={editor?.isActive("underline")}
          title="Underline (Ctrl+U)"
        >
          <FormatUnderlinedIcon fontSize="small" />
        </MenuButton>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <MenuButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor?.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <span className="font-bold text-sm">H1</span>
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor?.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <span className="font-bold text-sm">H2</span>
        </MenuButton>
        <MenuButton
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor?.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <span className="font-bold text-sm">H3</span>
        </MenuButton>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <MenuButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList")}
          title="Bullet List"
        >
          <FormatListBulletedIcon fontSize="small" />
        </MenuButton>
        <MenuButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={editor?.isActive("orderedList")}
          title="Numbered List"
        >
          <FormatListNumberedIcon fontSize="small" />
        </MenuButton>
        <MenuButton
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          active={editor?.isActive("blockquote")}
          title="Quote"
        >
          <FormatQuoteIcon fontSize="small" />
        </MenuButton>
        <MenuButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          active={editor?.isActive("codeBlock")}
          title="Code Block"
        >
          <CodeIcon fontSize="small" />
        </MenuButton>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <MenuButton
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          active={editor?.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <FormatAlignLeftIcon fontSize="small" />
        </MenuButton>
        <MenuButton
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          active={editor?.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <FormatAlignCenterIcon fontSize="small" />
        </MenuButton>
        <MenuButton
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          active={editor?.isActive({ textAlign: "right" })}
          title="Align Right"
        >
          <FormatAlignRightIcon fontSize="small" />
        </MenuButton>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <MenuButton onClick={handleImageUpload} title="Insert Image">
          <ImageIcon fontSize="small" />
        </MenuButton>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <MenuButton
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          title="Undo"
        >
          <UndoIcon fontSize="small" />
        </MenuButton>
        <MenuButton
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          title="Redo"
        >
          <RedoIcon fontSize="small" />
        </MenuButton>
      </div>

      <div className="flex-1 overflow-auto bg-white rounded-xl mt-4 border border-gray-100">
        <EditorContent editor={editor} className="prose max-w-none h-full" />
      </div>

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            togglePin();
            setAnchorEl(null);
          }}
        >
          <PushPinIcon fontSize="small" className="mr-2" />{" "}
          {currentNote?.isPinned ? "Unpin" : "Pin"} Note
        </MenuItem>
        <MenuItem
          onClick={() => {
            toggleFavorite();
            setAnchorEl(null);
          }}
        >
          <StarIcon fontSize="small" className="mr-2" />{" "}
          {currentNote?.isFavorite ? "Remove from" : "Add to"} Favorites
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleSummarize();
            setAnchorEl(null);
          }}
          disabled={aiLoading}
        >
          <AutoAwesomeIcon fontSize="small" className="mr-2" /> AI Summarize
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleGenerateQuiz();
            setAnchorEl(null);
          }}
          disabled={aiLoading}
        >
          <QuizIcon fontSize="small" className="mr-2" /> Generate Quiz
        </MenuItem>
      </Menu>

      <Dialog
        open={shareModal}
        onClose={() => setShareModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Share Note</h2>
            <button
              onClick={() => setShareModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <CloseIcon />
            </button>
          </div>
          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="input-field"
                placeholder="colleague@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permission
              </label>
              <select
                value={sharePermission}
                onChange={(e) => setSharePermission(e.target.value)}
                className="input-field"
              >
                <option value="view">Can View</option>
                <option value="edit">Can Edit</option>
              </select>
            </div>
            {currentNote?.collaborators?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Collaborators
                </label>
                <div className="space-y-2">
                  {currentNote.collaborators.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar
                          src={c.user?.profilePicture?.url}
                          sx={{ width: 24, height: 24 }}
                        >
                          {c.user?.name?.charAt(0)}
                        </Avatar>
                        <span className="text-sm">{c.user?.email}</span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">
                        {c.permission}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShareModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Share
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      <Dialog
        open={summaryModal}
        onClose={() => setSummaryModal(false)}
        maxWidth="md"
        fullWidth
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">AI Summary</h2>
            <button
              onClick={() => setSummaryModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="prose max-w-none bg-gray-50 p-4 rounded-xl">
            {summary}
          </div>
        </div>
      </Dialog>

      <Dialog
        open={quizModal}
        onClose={() => setQuizModal(false)}
        maxWidth="md"
        fullWidth
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Practice Quiz</h2>
            <button
              onClick={() => setQuizModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <CloseIcon />
            </button>
          </div>
          {quiz?.questions?.map((q, i) => (
            <div key={i} className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="font-medium mb-3">
                {i + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options?.map((opt, j) => (
                  <div
                    key={j}
                    className={`p-2 rounded-lg border ${
                      j === q.correctAnswer
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >
                    {String.fromCharCode(65 + j)}. {opt}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <p className="text-sm text-gray-600 mt-2">💡 {q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}
