import { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import ShareIcon from "@mui/icons-material/Share";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import QuizIcon from "@mui/icons-material/Quiz";
import FolderIcon from "@mui/icons-material/Folder";
import CommentIcon from "@mui/icons-material/Comment";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AnimatedBackground from "../../components/ui/AnimatedBackground";
import GlassCard from "../../components/ui/GlassCard";

gsap.registerPlugin(ScrollTrigger);

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
  const containerRef = useRef(null);

  useGSAP(() => {
    // Alternating Scroll Reveal
    const serviceItems = gsap.utils.toArray(".service-item");
    
    serviceItems.forEach((item, i) => {
      const direction = i % 2 === 0 ? -50 : 50;
      
      gsap.fromTo(item, 
        { opacity: 0, x: direction },
        {
          opacity: 1,
          x: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-[#0a0118] relative">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 h-screen overflow-hidden">
        <img 
          src="/services_students_bg.png" 
          alt="Hands typing" 
          className="w-full h-full object-cover opacity-[0.15] mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0118]/60 via-[#0a0118]/80 to-[#0a0118]" />
      </div>

      <div className="relative py-32 lg:py-40 overflow-hidden z-10">
        <AnimatedBackground variant="mesh" showMesh />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-24"
          >
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
              Our <span className="gradient-text">Services</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              VPad offers a comprehensive suite of features designed to enhance
              your academic note-taking experience, organized precisely how you study.
            </p>
          </motion.div>

          {/* Alternating Layout Grid */}
          <div className="space-y-16 lg:space-y-24">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={service.title} 
                  className={`service-item flex flex-col lg:flex-row items-center gap-10 ${isEven ? '' : 'lg:flex-row-reverse'}`}
                >
                  {/* Visual/Icon Side */}
                  <div className="w-full lg:w-5/12 flex justify-center">
                     <motion.div
                        className="w-40 h-40 rounded-3xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-[0_0_40px_rgba(139,92,246,0.3)] relative overflow-hidden"
                        whileHover={{ scale: 1.05, rotate: isEven ? 5 : -5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />
                        <Icon className="text-white relative z-10" style={{ fontSize: 80 }} />
                      </motion.div>
                  </div>

                  {/* Content Side */}
                  <div className="w-full lg:w-7/12">
                    <GlassCard className="p-8 sm:p-10 border-white/5 bg-[#160e30]/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                      <h3 className="text-3xl font-bold text-white mb-4">
                        {service.title}
                      </h3>
                      <p className="text-lg text-gray-400 mb-8 leading-relaxed">{service.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {service.features.map((feature, fIdx) => (
                          <motion.div
                            key={feature}
                            className="flex items-center text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + fIdx * 0.1 }}
                          >
                            <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center mr-3 flex-shrink-0 text-primary-400">
                               <span className="text-sm">✓</span>
                            </div>
                            <span className="font-medium">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </GlassCard>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Multilingual section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-32 text-center"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/30 to-secondary-600/30" />
              <AnimatedBackground variant="particles" showParticles />
              <div className="relative p-12 sm:p-20 bg-[#0a0118]/40 backdrop-blur-sm border border-white/10">
                <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-md">
                  Global Accessibility
                </h2>
                <p className="text-gray-300 text-xl mb-10 max-w-3xl mx-auto leading-relaxed">
                  VPad fully supports both English and Urdu languages with proper
                  RTL (Right-to-Left) text handling, seamlessly blending left-to-right text with right-to-left languages.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                  {[
                    { label: "English (LTR)", fontClass: "" },
                    { label: "اردو (RTL)", fontClass: "font-urdu" },
                    { label: "Math Equations (LaTeX)", fontClass: "" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.label}
                      className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-xl border border-white/20 shadow-lg"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                    >
                      <span className={`text-white text-lg font-semibold tracking-wide ${item.fontClass}`}>
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
