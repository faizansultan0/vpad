import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By using VPad, you agree to these Terms of Service. If you do not agree, please do not use the platform.",
  },
  {
    title: "2. Your Account",
    content:
      "You are responsible for maintaining account security and for all activity under your account. Provide accurate information and keep your credentials confidential.",
  },
  {
    title: "3. Acceptable Use",
    content:
      "You must not misuse the service, attempt unauthorized access, upload malicious content, or violate applicable laws while using VPad.",
  },
  {
    title: "4. Your Content",
    content:
      "You retain ownership of your notes and uploaded content. You grant VPad the limited rights required to host, process, and display your content in order to provide the service.",
  },
  {
    title: "5. Collaboration and Sharing",
    content:
      "When you share notes with collaborators, they may view or edit content based on granted permissions. You are responsible for managing sharing settings.",
  },
  {
    title: "6. Service Availability",
    content:
      "We aim for reliable uptime but cannot guarantee uninterrupted availability. Features may be updated, modified, or discontinued to improve the platform.",
  },
  {
    title: "7. Termination",
    content:
      "We may suspend or terminate access for violations of these terms or harmful behavior. You may stop using the service at any time.",
  },
  {
    title: "8. Contact",
    content:
      "For legal or policy questions, contact us through the Contact page in the application.",
  },
];

export default function Terms() {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-600">Last updated: April 12, 2026</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card space-y-6"
        >
          <p className="text-gray-700 leading-relaxed">
            These Terms of Service govern your use of VPad. Please read them
            carefully before using the platform.
          </p>

          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
              <p className="text-gray-700 leading-relaxed">{section.content}</p>
            </section>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
