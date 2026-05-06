import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
import DownloadIcon from "@mui/icons-material/Download";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const MenuButton = ({ onClick, active, disabled, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-colors ${
      active
        ? "bg-primary-100 dark:bg-primary-600/20 text-primary-600 dark:text-primary-300"
        : "icon-btn"
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

  const urduRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const hasUrdu = urduRegex.test(summaryText);
  const lines = summaryText.split(/\r?\n/);
  const blocks = [];
  let listItems = [];
  let listType = null;
  let keyCounter = 0;

  const flushList = () => {
    if (listItems.length === 0) return;

    if (listType === "ol") {
      blocks.push(
        <ol
          key={`ol-${keyCounter++}`}
          className="list-decimal list-inside space-y-1"
        >
          {listItems.map((item, index) => (
            <li key={`${index}-${item.slice(0, 16)}`}>
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>,
      );
    } else {
      blocks.push(
        <ul
          key={`ul-${keyCounter++}`}
          className="list-disc list-inside space-y-1"
        >
          {listItems.map((item, index) => (
            <li key={`${index}-${item.slice(0, 16)}`}>
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>,
      );
    }

    listItems = [];
    listType = null;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = Math.min(3, headingMatch[1].length);
      const headingText = headingMatch[2];
      const HeadingTag = level === 1 ? "h2" : "h3";
      blocks.push(
        <HeadingTag
          key={`h-${keyCounter++}`}
          className="text-base font-semibold text-white"
        >
          {renderInlineMarkdown(headingText)}
        </HeadingTag>,
      );
      return;
    }

    const orderedMatch = line.match(/^\d+[\.)]\s+(.+)$/);
    if (orderedMatch) {
      if (listType && listType !== "ol") {
        flushList();
      }
      listType = "ol";
      listItems.push(orderedMatch[1]);
      return;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.+)$/);
    if (unorderedMatch) {
      if (listType && listType !== "ul") {
        flushList();
      }
      listType = "ul";
      listItems.push(unorderedMatch[1]);
      return;
    }

    flushList();
    blocks.push(<p key={`p-${keyCounter++}`}>{renderInlineMarkdown(line)}</p>);
  });

  flushList();

  return (
    <div
      dir={hasUrdu ? "rtl" : "ltr"}
      className={`space-y-3 text-gray-800 dark:text-gray-200 leading-7 ${
        hasUrdu ? "text-right" : "text-left"
      }`}
    >
      {blocks}
    </div>
  );
};

const getSpeechRecognitionConstructor = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const buildInstitutionContentPath = (institutionId, semesterId, subjectId) => {
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

export default function NoteEditor() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, accessToken } = useAuthStore();
  const {
    currentNote,
    fetchNote,
    updateNote,
    deleteNote,
    shareNote,
    summarizeNote,
    generateQuiz,
    uploadAttachment,
    submitQuizAttempt,
    comments,
    fetchComments,
    createComment,
    deleteComment,
    downloadNoteAsPdf,
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
  const [isDictating, setIsDictating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const fetchedRef = useRef(false);
  const recorderRef = useRef(null);
  const recordingStreamRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const recognitionRef = useRef(null);

  const noteInstitutionId =
    currentNote?.institution?._id || currentNote?.institution || null;
  const noteSemesterId = currentNote?.semester?._id || currentNote?.semester || null;
  const noteSubjectId = currentNote?.subject?._id || currentNote?.subject || null;
  const notesListPath =
    typeof location.state?.returnTo === "string" && location.state.returnTo
      ? location.state.returnTo
      : buildInstitutionContentPath(
          noteInstitutionId,
          noteSemesterId,
          noteSubjectId,
        );

  const isOwner =
    String(currentNote?.user?._id || currentNote?.user) === String(user?._id);
  const collaboratorEntry = currentNote?.collaborators?.find(
    (collab) => String(collab?.user?._id || collab?.user) === String(user?._id),
  );
  const canComment =
    isOwner || ["edit", "admin"].includes(collaboratorEntry?.permission);
  const speechRecognitionSupported = Boolean(getSpeechRecognitionConstructor());

  const stopActiveDictation = useCallback(() => {
    const recognition = recognitionRef.current;

    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;

      try {
        recognition.stop();
      } catch (error) {
        // Ignore stop errors caused by inactive recognition instances.
      }

      recognitionRef.current = null;
    }

    setIsDictating(false);
  }, []);

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
        navigate("/institutions", { replace: true });
      }
    };
    load();

    return () => {
      stopActiveDictation();
      leaveNote(noteId);
      clearComments();
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [noteId, navigate, stopActiveDictation]);

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

  const resolveDictationLanguage = useCallback(() => {
    if (currentNote?.language === "ur" || currentNote?.isRtl) {
      return "ur-PK";
    }
    if (currentNote?.language === "en") {
      return "en-US";
    }
    return "en-PK";
  }, [currentNote?.isRtl, currentNote?.language]);

  const insertDictationText = useCallback(
    (transcript) => {
      if (!editor || !transcript) return;

      const normalizedText = transcript.replace(/\s+/g, " ").trim();
      if (!normalizedText) return;

      const { from } = editor.state.selection;
      const charBefore =
        from > 1 ? editor.state.doc.textBetween(from - 1, from, "") : "";
      const needsLeadingSpace = Boolean(charBefore && !/\s/.test(charBefore));
      const textToInsert = `${needsLeadingSpace ? " " : ""}${normalizedText} `;

      editor.chain().focus().insertContent(textToInsert).run();
    },
    [editor],
  );

  const handleStartDictation = useCallback(() => {
    if (isDictating) return;

    if (!editor) {
      toast.error("Editor is not ready yet.");
      return;
    }

    if (isRecording) {
      toast.error("Stop voice comment recording before starting note dictation.");
      return;
    }

    const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionConstructor) {
      toast.error("Voice typing is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = resolveDictationLanguage();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsDictating(true);
    };

    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript || "";
        if (!transcript) continue;

        if (result.isFinal) {
          insertDictationText(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;

      if (["not-allowed", "service-not-allowed"].includes(event.error)) {
        toast.error("Microphone permission is required for voice typing.");
        return;
      }

      toast.error("Voice typing failed. Please try again.");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsDictating(false);
    };

    recognitionRef.current = recognition;
    setIsDictating(true);

    try {
      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
      setIsDictating(false);
      toast.error("Unable to start voice typing.");
    }
  }, [
    editor,
    insertDictationText,
    isDictating,
    isRecording,
    resolveDictationLanguage,
  ]);

  const handleStopDictation = useCallback(() => {
    stopActiveDictation();
  }, [stopActiveDictation]);

  const handleStartRecording = useCallback(async () => {
    if (isRecording) return;

    if (isDictating) {
      toast.error("Stop note dictation before recording a voice comment.");
      return;
    }

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
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
        const blob = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm",
        });
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
  }, [audioPreviewUrl, isDictating, isRecording, stopActiveRecording]);

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
    if (!hasChanges) return true;
    setIsSaving(true);
    try {
      await updateNote(noteId, { title, content: editor?.getHTML() });
      setHasChanges(false);
      toast.success("Saved");
      return true;
    } catch (error) {
      toast.error("Failed to save");
      return false;
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
    setIsSharing(true);
    try {
      await shareNote(noteId, shareEmail, sharePermission);
      toast.success("Note shared successfully");
      setShareModal(false);
      setShareEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to share");
    } finally {
      setIsSharing(false);
    }
  };

  const handleSummarize = async (regenerate = false) => {
    setSummaryModal(true);
    setAiLoading(true);
    try {
      const result = await summarizeNote(noteId, { regenerate });
      setSummary(result.summary?.text || "");
      setSummaryNeedsRegeneration(Boolean(result.needsRegeneration));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to summarize");
      if (!regenerate) setSummaryModal(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateQuiz = async (regenerate = false) => {
    setQuizModal(true);
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

      toast.success(regenerate ? "Quiz regenerated" : "Quiz ready");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate quiz");
      if (!regenerate) setQuizModal(false);
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

  const handleBack = useCallback(async () => {
    const saved = await handleSave();
    if (!saved) return;
    navigate(notesListPath);
  }, [handleSave, navigate, notesListPath]);

  const handleDeleteNote = useCallback(async () => {
    try {
      await deleteNote(noteId);
      setDeleteNoteDialogOpen(false);
      toast.success("Note deleted");
      navigate(notesListPath);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete note");
    }
  }, [deleteNote, navigate, noteId, notesListPath]);

  const handleDownloadNote = useCallback(async () => {
    try {
      const noteContent = editor?.getHTML() || currentNote?.content || "";
      const hasRtlContent = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(
        noteContent.replace(/<[^>]*>/g, " "),
      );

      await downloadNoteAsPdf({
        ...currentNote,
        title: title.trim() || currentNote?.title || "Untitled Note",
        content: noteContent,
        isRtl:
          typeof currentNote?.isRtl === "boolean"
            ? currentNote.isRtl
            : hasRtlContent,
        updatedAt: hasChanges ? new Date().toISOString() : currentNote?.updatedAt,
      });
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error("Failed to download note");
    }
  }, [currentNote, downloadNoteAsPdf, editor, hasChanges, title]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-light-border dark:border-white/[0.06]">
        <div className="flex items-center space-x-4 min-w-0 flex-1">
          <button
            onClick={handleBack}
            className="icon-btn p-2"
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
            className="text-xl font-semibold bg-transparent border-none outline-none focus:ring-0 w-full max-w-md min-w-0"
            style={{ color: "var(--color-text)" }}
            placeholder="Note title"
          />
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
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
            className="icon-btn p-2"
            title="Share"
          >
            <ShareIcon />
          </button>
          <button
            onClick={(e) => setAnchorEl(e.currentTarget)}
            className="icon-btn p-2"
          >
            <MoreVertIcon />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-1 py-2 border-b border-light-border dark:border-white/[0.06] overflow-x-auto">
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
        <MenuButton
          onClick={isDictating ? handleStopDictation : handleStartDictation}
          disabled={!speechRecognitionSupported || isRecording}
          title={
            !speechRecognitionSupported
              ? "Voice typing is not supported in this browser"
              : isRecording
                ? "Stop comment recording to start voice typing"
                : isDictating
                  ? "Stop voice typing"
                  : "Start voice typing"
          }
        >
          {isDictating ? (
            <StopIcon fontSize="small" />
          ) : (
            <MicIcon fontSize="small" />
          )}
        </MenuButton>
        {isDictating && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-900/20 text-red-600 dark:text-red-300 text-[11px] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Listening
          </span>
        )}
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

      <div className="flex-1 overflow-auto bg-light-card dark:bg-dark-card rounded-xl mt-4 border border-light-border dark:border-white/[0.06]">
        <EditorContent editor={editor} className="prose max-w-none h-full" />
      </div>

      <div className="mt-4 border border-light-border dark:border-white/[0.06] rounded-xl bg-light-card dark:bg-dark-card overflow-hidden">
        <button
          onClick={() => setCommentsExpanded(!commentsExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
            Comments
            {comments.length > 0 && (
              <span className="text-xs font-normal bg-primary-600/20 text-primary-300 px-2 py-0.5 rounded-full">
                {comments.length}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {!canComment && (
              <span className="text-xs text-gray-400">View-only</span>
            )}
            {commentsExpanded ? (
              <ExpandLessIcon className="text-gray-400" />
            ) : (
              <ExpandMoreIcon className="text-gray-400" />
            )}
          </div>
        </button>

        {commentsExpanded && (
          <div className="p-4 pt-0 overflow-auto max-h-[40vh]">
            <form onSubmit={handleCommentSubmit} className="space-y-3 mb-4">
              <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            className="input-field resize-none"
            rows={3}
            placeholder={
              canComment
                ? "Add a text comment..."
                : "You can view comments only"
            }
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
                <StopIcon fontSize="small" className="mr-1" /> Stop (
                {recordingDuration}s)
              </button>
            )}

            {audioPreviewUrl && (
              <>
                <audio controls src={audioPreviewUrl} className="h-10" />
                <button
                  type="button"
                  onClick={clearRecordedAudio}
                  className="text-sm px-3 py-2 rounded-lg bg-light-surface dark:bg-dark-surface hover:bg-light-hover dark:hover:bg-dark-hover text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
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
            <p className="text-sm text-gray-400">
              No comments yet.
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="rounded-xl border border-light-border dark:border-white/[0.06] p-3 bg-light-surface dark:bg-dark-surface/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <Avatar
                      src={comment.user?.profilePicture?.url}
                      sx={{ width: 28, height: 28 }}
                    >
                      {comment.user?.name?.charAt(0)}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                        {comment.user?.name || "User"}
                      </p>
                      {comment.content && (
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      )}
                      {comment.audio?.url && (
                        <div className="mt-2 flex items-center gap-2">
                          <VolumeUpIcon
                            fontSize="small"
                            className="text-primary-600"
                          />
                          <audio
                            controls
                            src={comment.audio.url}
                            className="h-10"
                          />
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

                {Array.isArray(comment.replies) &&
                  comment.replies.length > 0 && (
                    <div className="mt-3 ml-8 space-y-2">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply._id}
                          className="rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-white/[0.06] p-2"
                        >
                          <p className="text-xs font-semibold text-gray-300">
                            {reply.user?.name || "User"}
                          </p>
                          <p className="text-sm text-gray-400 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                          {reply.audio?.url && (
                            <audio
                              controls
                              src={reply.audio.url}
                              className="h-8 mt-1"
                            />
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
        )}
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
        <MenuItem
          onClick={() => {
            handleDownloadNote();
            setAnchorEl(null);
          }}
        >
          <DownloadIcon fontSize="small" className="mr-2" /> Download Note
          (.pdf)
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteNoteDialogOpen(true);
            setAnchorEl(null);
          }}
        >
          <DeleteIcon fontSize="small" className="mr-2 text-red-500" />
          Delete Note
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteNoteDialogOpen}
        onClose={() => setDeleteNoteDialogOpen(false)}
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
            This will delete &quot;{title || currentNote?.title || "Untitled Note"}&quot;.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setDeleteNoteDialogOpen(false)}
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
              className="icon-btn p-2"
            >
              <CloseIcon />
            </button>
          </div>
          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Collaborators
                </label>
                <div className="space-y-2">
                  {currentNote.collaborators.map((c) => (
                    <div
                      key={c._id}
                      className="flex items-center justify-between p-2 bg-light-surface dark:bg-dark-surface rounded-lg"
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
                      <span className="text-xs text-gray-400 capitalize">
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
                disabled={isSharing}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={isSharing}>
                {isSharing ? "Sharing..." : "Share"}
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
                className="icon-btn p-2"
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
            <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-xl max-h-[70vh] overflow-auto min-h-[240px] flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : (
            <div className="bg-light-surface dark:bg-dark-surface p-4 rounded-xl max-h-[70vh] overflow-auto">
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
                className="icon-btn p-2"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          {aiLoading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <div className="spinner mb-4" />
              <span className="text-gray-400">Processing...</span>
            </div>
          ) : (
            <>
              {quizResult && (
                <div className="mb-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-600/20 text-primary-800 dark:text-primary-200 text-sm font-medium">
                  Score: {quizResult.score}/{quizResult.totalQuestions} (
                  {quizResult.percentage}%)
                </div>
              )}
              {quiz?.questions?.map((q, i) => (
                <div
                  key={i}
                  className="mb-6 p-4 bg-light-surface dark:bg-dark-surface rounded-xl"
                >
                  <p className="font-medium mb-3" style={{ color: "var(--color-text)" }}>
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
                              ? "border-green-500 bg-green-50 text-green-900 dark:bg-green-900/30 dark:text-green-100"
                              : selectedAnswers[i] === j
                                ? "border-red-500 bg-red-50 text-red-900 dark:bg-red-900/30 dark:text-red-100"
                                : "border-gray-200 dark:border-white/[0.06]"
                            : selectedAnswers[i] === j
                              ? "border-primary-500 bg-primary-50 dark:bg-primary-600/20 text-primary-900 dark:text-primary-100"
                              : "border-gray-200 dark:border-white/[0.06] hover:border-primary-300"
                        }`}
                        disabled={quizSubmitted}
                      >
                        {String.fromCharCode(65 + j)}. {opt}
                      </button>
                    ))}
                  </div>
                  {quizSubmitted && q.explanation && (
                    <p className="text-sm text-gray-400 mt-2">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              ))}
              {quiz?.questions?.length > 0 && !quizSubmitted && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSubmitQuiz}
                    className="btn-primary"
                  >
                    Submit Quiz
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
}
