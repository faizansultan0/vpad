import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useNoteStore } from "../../store";
import NoteIcon from "@mui/icons-material/Note";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import Avatar from "@mui/material/Avatar";
import { format } from "date-fns";

export default function SharedNotes() {
  const { notes, fetchNotes, isLoading } = useNoteStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNotes({ shared: "true" });
  }, []);

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Shared Notes</h1>
        <p className="text-gray-400">Notes shared with you by others</p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
          placeholder="Search shared notes..."
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/notes/${note._id}`}
                state={{ returnTo: "/shared" }}
                className="card block hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center">
                    <NoteIcon className="text-white" fontSize="small" />
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <PersonIcon fontSize="small" />
                    <span>Shared</span>
                  </div>
                </div>
                <h3 className="font-semibold text-white line-clamp-2 mb-2">
                  {note.title}
                </h3>
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar
                    src={note.user?.profilePicture?.url}
                    sx={{ width: 20, height: 20 }}
                  >
                    {note.user?.name?.charAt(0)}
                  </Avatar>
                  <span className="text-sm text-gray-400">
                    {note.user?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{note.subject?.name}</span>
                  <span>{format(new Date(note.updatedAt), "MMM d")}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <NoteIcon className="text-gray-300 mb-4" style={{ fontSize: 64 }} />
          <h3 className="text-xl font-semibold text-white mb-2">
            {search ? "No Notes Found" : "No Shared Notes"}
          </h3>
          <p className="text-gray-400">
            {search
              ? "Try a different search term"
              : "When someone shares a note with you, it will appear here"}
          </p>
        </div>
      )}
    </div>
  );
}
