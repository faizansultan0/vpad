import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import GroupsIcon from "@mui/icons-material/Groups";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TranslateIcon from "@mui/icons-material/Translate";
import SecurityIcon from "@mui/icons-material/Security";

const features = [
  {
    icon: AutoStoriesIcon,
    title: "Rich Note Taking",
    description:
      "Create beautiful notes with our rich text editor supporting multiple languages and math equations.",
  },
  {
    icon: GroupsIcon,
    title: "Real-time Collaboration",
    description:
      "Work together with classmates on shared notes with live updates and seamless syncing.",
  },
  {
    icon: CloudSyncIcon,
    title: "Organized Structure",
    description:
      "Organize notes by Institution, Semester, and Subject for easy access and management.",
  },
  {
    icon: PsychologyIcon,
    title: "AI-Powered Features",
    description:
      "Summarize notes, extract text from images, and generate quizzes with AI assistance.",
  },
  {
    icon: TranslateIcon,
    title: "Multilingual Support",
    description:
      "Full support for English and Urdu (RTL) with proper text direction handling.",
  },
  {
    icon: SecurityIcon,
    title: "Secure & Private",
    description:
      "Your notes are private by default with secure sharing options when you need them.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-200 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Smart Notes for
              <span className="block gradient-text">Modern Students</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              VPad helps you organize, write, share, and collaborate on your
              academic notes. Support for multiple languages, math equations,
              and AI-powered features.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Get Started Free
              </Link>
              <Link to="/services" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white min-h-[300px] flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <AutoStoriesIcon
                    style={{ fontSize: 80 }}
                    className="mb-4 text-primary-300"
                  />
                  <p className="text-lg font-medium">
                    Your notes dashboard awaits
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for students to excel in
              their academic journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card hover:border-primary-200"
                >
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                    <Icon className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Note-Taking?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Join thousands of students who are already using VPad to organize
              their academic life.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Start for Free
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
