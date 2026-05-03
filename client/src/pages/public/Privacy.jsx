import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect account details such as name and email, profile data you provide, and content you create in notes, attachments, and collaboration activity.",
  },
  {
    title: "2. How We Use Information",
    content:
      "We use your data to operate VPad, authenticate users, enable collaboration features, improve performance, and provide support.",
  },
  {
    title: "3. Sharing of Data",
    content:
      "We do not sell personal data. Information is shared only as needed to provide platform functionality, with your collaborators based on permissions, or when legally required.",
  },
  {
    title: "4. Data Retention",
    content:
      "We retain information while your account is active or as needed for operational and legal purposes. You can request deletion according to applicable laws.",
  },
  {
    title: "5. Security",
    content:
      "We apply reasonable technical and organizational safeguards to protect your information. No system can be guaranteed to be 100% secure.",
  },
  {
    title: "6. Cookies and Analytics",
    content:
      "VPad may use essential cookies and analytics tools to keep sessions secure, remember preferences, and understand feature usage.",
  },
  {
    title: "7. Your Rights",
    content:
      "Depending on your jurisdiction, you may have rights to access, correct, export, or delete your personal data.",
  },
  {
    title: "8. Contact",
    content:
      "If you have privacy questions, contact us via the Contact page in the application.",
  },
];

export default function Privacy() {
  return (
    <div className="py-32 bg-[#0a0118] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-primary-400">Last updated: April 12, 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card-glow border border-white/10 bg-[#130a2a]/60 p-8 sm:p-12 space-y-8"
        >
          <p className="text-gray-300 text-lg leading-relaxed">
            This Privacy Policy explains how VPad collects, uses, and protects
            your information when you use the platform.
          </p>

          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-2xl font-bold text-white">
                {section.title}
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg">{section.content}</p>
            </section>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
