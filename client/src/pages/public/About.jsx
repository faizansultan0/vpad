import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FavoriteIcon from "@mui/icons-material/Favorite";

const stats = [
  { label: "Active Users", value: "10,000+" },
  { label: "Notes Created", value: "50,000+" },
  { label: "Institutions", value: "500+" },
  { label: "Countries", value: "25+" },
];

const values = [
  {
    icon: SchoolIcon,
    title: "Education First",
    description:
      "We believe in making quality education accessible to everyone through better tools.",
  },
  {
    icon: GroupsIcon,
    title: "Collaboration",
    description:
      "Learning is better together. We enable seamless collaboration between students.",
  },
  {
    icon: TrendingUpIcon,
    title: "Continuous Improvement",
    description:
      "We constantly evolve our platform based on student feedback and needs.",
  },
  {
    icon: FavoriteIcon,
    title: "Student-Centric",
    description: "Every feature we build is designed with students in mind.",
  },
];

const team = [
  {
    name: "Development Team",
    role: "Full-Stack Engineers",
    description: "Building robust and scalable solutions",
  },
  {
    name: "Design Team",
    role: "UI/UX Designers",
    description: "Creating beautiful and intuitive interfaces",
  },
  {
    name: "AI Team",
    role: "ML Engineers",
    description: "Powering intelligent features",
  },
  {
    name: "Support Team",
    role: "Customer Success",
    description: "Ensuring student satisfaction",
  },
];

export default function About() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            About <span className="gradient-text">VPad</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            VPad was born from a simple idea: students deserve better tools for
            managing their academic notes. We're building the future of
            collaborative learning.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-3xl p-8 sm:p-12 mb-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Mission
          </h2>
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sm:p-12">
            <p className="text-lg text-gray-600 leading-relaxed text-center max-w-4xl mx-auto">
              Our mission is to empower students worldwide with intelligent
              note-taking tools that enhance their learning experience. We
              believe that organized, accessible, and collaborative notes are
              the foundation of academic success. VPad combines modern
              technology with thoughtful design to create a platform that adapts
              to how students actually study and learn.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="card text-center"
                >
                  <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-white" fontSize="large" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 text-sm font-medium mb-2">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
