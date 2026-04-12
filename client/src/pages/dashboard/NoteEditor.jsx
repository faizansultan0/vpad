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
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const MenuButton = ({ onClick, active, disabled, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      active
        ? "bg-primary-100 dark:bg-primary-600/20 text-primary-600 dark:text-primary-300"
        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {children}
  </button>
);

const renderInlineMarkdown = (text) => {
  const chunks = text.split(/(\*\*.*?\*\*)/g);
  return chunks.map((chunk, index) => {
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return <strong key={index}>{chunk.slice(2, -2)}</strong>;
    }
    return <span key={index}>{chunk}</span>;
  });
};

const renderFormattedSummary = (summaryText) => {
  if (!summaryText) return null;

  const normalizedText = summaryText.replace(/\s\*\s+/g, "\n* ");
  const lines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3 text-gray-800 dark:text-gray-200 leading-7">
      {lines.map((line, index) => {
        if (/^#{1,6}\s+/.test(line)) {
          const headingText = line.replace(/^#{1,6}\s+/, "");
          return (
            <h3 key={index} className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {renderInlineMarkdown(headingText)}
            </h3>
          );
        }

        if (line.startsWith("* ")) {
          return (
            <div key={index} className="flex items-start gap-2">
              <span className="mt-1 text-primary-600">•</span>
              <p>{renderInlineMarkdown(line.slice(2))}</p>
            </div>
          );
        }

        return <p key={index}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
};

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
    submitQuizAttempt,
    comments,
    fetchComments,
    createComment,
    deleteComment,
    clearComments,
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
  const [summaryNeedsRegeneration, setSummaryNeedsRegeneration] =
    useState(false);
  const [quizModal, setQuizModal] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const fetchedRef = useRef(false);
  const recorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const isOwner = String(currentNote?.user?._id || currentNote?.user) === String(user?._id);
  const collaboratorEntry = currentNote?.collaborators?.find(
    (collab) => String(collab?.user?._id || collab?.user) === String(user?._id),
  );
  const canComment = isOwner || ["edit", "admin"].includes(collaboratorEntry?.permission);

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
        await fetchComments(noteId);
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
      clearComments();
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
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

  useEffect(() => {
    const refreshComments = (payload) => {
      if (payload?.noteId && String(payload.noteId) !== String(noteId)) return;
      fetchComments(noteId).catch(() => {});
    };

    on("newComment", refreshComments);
    on("commentUpdated", refreshComments);
    on("commentDeleted", refreshComments);
    on("commentReaction", refreshComments);

    return () => {
      off("newComment", refreshComments);
      off("commentUpdated", refreshComments);
      off("commentDeleted", refreshComments);
      off("commentReaction", refreshComments);
    };
  }, [noteId]);

  const stopActiveRecording = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      recordingStreamRef.current = null;
    }

    setIsRecording(false);
  }, []);

  const handleStartRecording = useCallback(async () => {
    if (isRecording) return;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recordingStreamRef.current = stream;
      recorderRef.current = recorder;
      setRecordingDuration(0);
      setAudioBlob(null);
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
      setAudioPreviewUrl("");

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        stopActiveRecording();
      };

      recorder.start();
      setIsRecording(true);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Unable to access microphone.");
    }
  }, [audioPreviewUrl, isRecording, stopActiveRecording]);

  const handleStopRecording = useCallback(() => {
    if (!recorderRef.current || recorderRef.current.state === "inactive") {
      stopActiveRecording();
      return;
    }
    recorderRef.current.stop();
  }, [stopActiveRecording]);

  const clearRecordedAudio = () => {
    setAudioBlob(null);
    setRecordingDuration(0);
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setAudioPreviewUrl("");
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!canComment) return;

    const trimmedComment = commentInput.trim();
    if (!trimmedComment && !audioBlob) {
      toast.error("Add text or record a voice comment.");
      return;
    }

    setIsCommentSubmitting(true);
    try {
      await createComment({
        noteId,
        content: trimmedComment,
        audioBlob,
        recordingDuration,
      });
      setCommentInput("");
      clearRecordedAudio();
      await fetchComments(noteId);
      toast.success("Comment posted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post comment");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      toast.success("Comment deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete comment");
    }
  };

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

  const handleSummarize = async (regenerate = false) => {
    setAiLoading(true);
    try {
      const result = await summarizeNote(noteId, { regenerate });
      setSummary(result.summary?.text || "");
      setSummaryNeedsRegeneration(Boolean(result.needsRegeneration));
      setSummaryModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to summarize");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateQuiz = async (regenerate = false) => {
    setAiLoading(true);
    try {
      const result = await generateQuiz(noteId, {
        questionCount: 5,
        difficulty: "medium",
        regenerate,
      });

      const attempts = Array.isArray(result?.attempts) ? result.attempts : [];
      const latestAttempt = attempts
        .filter((attempt) => String(attempt.user) === String(user?._id))
        .sort(
          (first, second) =>
            new Date(second.submittedAt) - new Date(first.submittedAt),
        )[0];

      setQuiz(result);

      if (latestAttempt && !regenerate) {
        const restoredAnswers = latestAttempt.answers.reduce(
          (accumulator, answer, index) => {
            if (Number.isInteger(answer) && answer >= 0) {
              accumulator[index] = answer;
            }
            return accumulator;
          },
          {},
        );

        setSelectedAnswers(restoredAnswers);
        setQuizSubmitted(true);
        setQuizResult(latestAttempt);
      } else {
        setSelectedAnswers({});
        setQuizSubmitted(false);
        setQuizResult(null);
      }

      setQuizModal(true);
      toast.success(regenerate ? "Quiz regenerated" : "Quiz ready");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate quiz");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (quizSubmitted) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz?.questions?.length) return;

    const answers = quiz.questions.map((_, questionIndex) => {
      const answer = selectedAnswers[questionIndex];
      return Number.isInteger(answer) ? answer : -1;
    });

    if (answers.some((answer) => answer < 0)) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setAiLoading(true);
    try {
      const result = await submitQuizAttempt(noteId, answers);
      setQuiz(result.quiz);
      setQuizResult(result.attempt);
      setQuizSubmitted(true);
      toast.success(
        `Submitted! Score: ${result.attempt.score}/${result.attempt.totalQuestions}`,
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit quiz");
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
      currentNote?.isFavorite ? "Removed from favorites" : "Added to favorites",
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
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              if (hasChanges) handleSave();
              navigate(-1);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
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
            className="text-xl font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none focus:ring-0 w-full max-w-md"
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
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            title="Share"
          >
            <ShareIcon />
          </button>
          <button
            onClick={(e) => setAnchorEl(e.currentTarget)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <MoreVertIcon />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-1 py-2 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
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
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
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
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
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
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
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
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
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

      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900 rounded-xl mt-4 border border-gray-100 dark:border-gray-700">
        <EditorContent editor={editor} className="prose max-w-none h-full" />
      </div>

      <div className="mt-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-4 overflow-auto max-h-[40vh]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Comments</h3>
          {!canComment && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              View-only collaborators cannot add comments
            </span>
          )}
        </div>

        <form onSubmit={handleCommentSubmit} className="space-y-3 mb-4">
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="input-field resize-none"
            rows={3}
            placeholder={canComment ? "Add a text comment..." : "You can view comments only"}
            disabled={!canComment || isCommentSubmitting}
          />

          <div className="flex flex-wrap gap-2 items-center">
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStartRecording}
                disabled={!canComment || isCommentSubmitting}
                className="btn-secondary inline-flex items-center text-sm py-2"
              >
                <MicIcon fontSize="small" className="mr-1" /> Record Voice
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm inline-flex items-center hover:bg-red-700 transition-colors"
              >
                <StopIcon fontSize="small" className="mr-1" /> Stop ({recordingDuration}s)
              </button>
            )}

            {audioPreviewUrl && (
              <>
                <audio controls src={audioPreviewUrl} className="h-10" />
                <button
                  type="button"
                  onClick={clearRecordedAudio}
                  className="text-sm px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Remove Audio
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={!canComment || isCommentSubmitting}
              className="btn-primary inline-flex items-center text-sm py-2"
            >
              <SendIcon fontSize="small" className="mr-1" />
              {isCommentSubmitting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="rounded-xl border border-gray-100 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Avatar
                      src={comment.user?.profilePicture?.url}
                      sx={{ width: 28, height: 28 }}
                    >
                      {comment.user?.name?.charAt(0)}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{comment.user?.name || "User"}</p>
                      {comment.content && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                      )}
                      {comment.audio?.url && (
                        <div className="mt-2 flex items-center gap-2">
                          <VolumeUpIcon fontSize="small" className="text-primary-600" />
                          <audio controls src={comment.audio.url} className="h-10" />
                        </div>
                      )}
                    </div>
                  </div>
                  {String(comment.user?._id) === String(user?._id) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment._id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete comment"
                    >
                      <DeleteIcon fontSize="small" className="text-red-500" />
                    </button>
                  )}
                </div>

                {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                  <div className="mt-3 ml-8 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-2">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{reply.user?.name || "User"}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{reply.content}</p>
                        {reply.audio?.url && (
                          <audio controls src={reply.audio.url} className="h-8 mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
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
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <CloseIcon />
            </button>
          </div>
          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Collaborators
                </label>
                <div className="space-y-2">
                  {currentNote.collaborators.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
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
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
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
            <div className="flex items-center gap-2">
              {summary && (
                <button
                  onClick={() => handleSummarize(true)}
                  className="btn-secondary text-sm py-2"
                  disabled={aiLoading}
                >
                  Regenerate
                </button>
              )}
              <button
                onClick={() => setSummaryModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          {summaryNeedsRegeneration && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm">
              You have new changes in this note. Click regenerate to refresh the
              summary.
            </div>
          )}
          {aiLoading ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl max-h-[70vh] overflow-auto min-h-[240px] flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl max-h-[70vh] overflow-auto">
              {renderFormattedSummary(summary)}
            </div>
          )}
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleGenerateQuiz(true)}
                className="btn-secondary text-sm py-2"
                disabled={aiLoading}
              >
                Regenerate
              </button>
              <button
                onClick={() => setQuizModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          {quizResult && (
            <div className="mb-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-600/20 text-primary-800 dark:text-primary-200 text-sm font-medium">
              Score: {quizResult.score}/{quizResult.totalQuestions} (
              {quizResult.percentage}%)
            </div>
          )}
          {quiz?.questions?.map((q, i) => (
            <div key={i} className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                {i + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options?.map((opt, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => handleSelectOption(i, j)}
                    className={`w-full text-left p-2 rounded-lg border transition-colors ${
                      quizSubmitted
                        ? j === q.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : selectedAnswers[i] === j
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 dark:border-gray-700"
                        : selectedAnswers[i] === j
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-600/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                    }`}
                  >
                    {String.fromCharCode(65 + j)}. {opt}
                  </button>
                ))}
              </div>
              {quizSubmitted && q.explanation && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">💡 {q.explanation}</p>
              )}
            </div>
          ))}
          {quiz?.questions?.length > 0 && !quizSubmitted && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmitQuiz}
                className="btn-primary"
                disabled={aiLoading}
              >
                Submit Quiz
              </button>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
