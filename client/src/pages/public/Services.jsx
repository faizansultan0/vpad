import { motion } from "framer-motion";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import ShareIcon from "@mui/icons-material/Share";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import QuizIcon from "@mui/icons-material/Quiz";
import FolderIcon from "@mui/icons-material/Folder";
import CommentIcon from "@mui/icons-material/Comment";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const services = [
  {
    icon: NoteAltIcon,
    title: "Rich Text Editor",
    description:
      "Create beautiful notes with our powerful editor supporting formatting, images, code blocks, and mathematical equations using LaTeX.",
    features: [
      "Bold, Italic, Underline",
      "Headings & Lists",
      "Code Blocks",
      "Math Equations (LaTeX)",
      "Image Attachments",
    ],
  },
  {
    icon: FolderIcon,
    title: "Academic Organization",
    description:
      "Organize your notes in a hierarchical structure that mirrors your academic life.",
    features: [
      "Institutions (School/College/University)",
      "Semesters & Years",
      "Subjects & Courses",
      "Custom Colors & Icons",
    ],
  },
  {
    icon: ShareIcon,
    title: "Note Sharing",
    description:
      "Share your notes with classmates and collaborate in real-time with live updates.",
    features: [
      "Share with Email",
      "View/Edit Permissions",
      "Real-time Collaboration",
      "Edit History Tracking",
    ],
  },
  {
    icon: SmartToyIcon,
    title: "AI Summarization",
    description:
      "Let AI summarize your lengthy notes into concise key points for quick revision.",
    features: [
      "Automatic Summaries",
      "Key Point Extraction",
      "Multi-language Support",
      "OpenAI & Gemini Integration",
    ],
  },
  {
    icon: ImageSearchIcon,
    title: "Handwritten Note OCR",
    description:
      "Upload images of handwritten notes and extract text automatically using AI.",
    features: [
      "Image Upload",
      "Text Extraction",
      "Math Formula Recognition",
      "Insert into Notes",
    ],
  },
  {
    icon: QuizIcon,
    title: "AI Quiz Generation",
    description:
      "Generate practice quizzes from your notes to test your knowledge and prepare for exams.",
    features: [
      "Auto-generated Questions",
      "Multiple Difficulty Levels",
      "Include Related Topics",
      "Instant Feedback",
    ],
  },
  {
    icon: CommentIcon,
    title: "Comments & Discussions",
    description:
      "Add comments to notes for discussions and clarifications with collaborators.",
    features: [
      "Rich Text Comments",
      "Threaded Replies",
      "Mentions (@user)",
      "Reactions",
    ],
  },
  {
    icon: NotificationsActiveIcon,
    title: "Real-time Notifications",
    description:
      "Stay updated with notifications for shares, comments, and collaboration activities.",
    features: [
      "In-app Notifications",
      "Email Notifications",
      "Customizable Preferences",
      "Admin Announcements",
    ],
  },
];

export default function Services() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="gradient-text">Services</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            VPad offers a comprehensive suite of features designed to enhance
            your academic note-taking experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                    <Icon className="text-white" fontSize="large" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center text-sm text-gray-500"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Multilingual Support
            </h2>
            <p className="text-white/80 text-lg mb-6 max-w-2xl mx-auto">
              VPad fully supports both English and Urdu languages with proper
              RTL (Right-to-Left) text handling, making it perfect for students
              in Pakistan and other regions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur px-6 py-3 rounded-xl">
                <span className="text-white font-medium">English (LTR)</span>
              </div>
              <div className="bg-white/10 backdrop-blur px-6 py-3 rounded-xl">
                <span className="text-white font-medium font-urdu">
                  اردو (RTL)
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur px-6 py-3 rounded-xl">
                <span className="text-white font-medium">
                  Math Equations (LaTeX)
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
