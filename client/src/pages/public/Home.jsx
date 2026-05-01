import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import GroupsIcon from "@mui/icons-material/Groups";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TranslateIcon from "@mui/icons-material/Translate";
import SecurityIcon from "@mui/icons-material/Security";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import AnimatedBackground from "../../components/ui/AnimatedBackground";
import GlassCard from "../../components/ui/GlassCard";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: AutoStoriesIcon,
    title: "Rich Note Taking",
    description: "Create beautiful notes with our rich text editor supporting multiple languages and math equations.",
  },
  {
    icon: GroupsIcon,
    title: "Real-time Collaboration",
    description: "Work together with classmates on shared notes with live updates and seamless syncing.",
  },
  {
    icon: CloudSyncIcon,
    title: "Organized Structure",
    description: "Organize notes by Institution, Semester, and Subject for easy access and management.",
  },
  {
    icon: PsychologyIcon,
    title: "AI-Powered Features",
    description: "Summarize notes, extract text from images, and generate quizzes with AI assistance.",
  },
  {
    icon: TranslateIcon,
    title: "Multilingual Support",
    description: "Full support for English and Urdu (RTL) with proper text direction handling.",
  },
  {
    icon: SecurityIcon,
    title: "Secure & Private",
    description: "Your notes are private by default with secure sharing options when you need them.",
  },
];

const testimonials = [
  // Group 1
  { name: "Sarah Ahmed", role: "Computer Science Student", text: "VPad completely changed how I organize my semesters. The LaTeX support is a lifesaver for my math courses." },
  { name: "Ali Khan", role: "Medical Student", text: "The AI summary feature helps me review long lecture notes in seconds. It's like having a personal study assistant." },
  { name: "Fatima Noor", role: "Literature Major", text: "I love the clean, dark interface. The real-time collaboration makes group assignments so much easier to coordinate." },
  { name: "Omar Tariq", role: "Engineering Student", text: "Finally, a note-taking app that handles both English and Urdu perfectly. The organization structure is exactly what I needed." },
  { name: "Aisha Malik", role: "Law Student", text: "The organization by institution and semester keeps my case briefs perfectly structured and easy to find." },
  { name: "Bilal Hassan", role: "Business Major", text: "Sharing notes with my project group is seamless. The real-time updates save us hours of back-and-forth emails." },
  // Group 2
  { name: "Zainab Shah", role: "Physics Student", text: "Being able to type complex equations alongside my regular notes without switching apps is incredible." },
  { name: "Hassan Raza", role: "History Major", text: "The dark mode is perfect for late-night study sessions. It's easy on the eyes and looks incredibly sleek." },
  { name: "Mariam Khan", role: "Psychology Student", text: "I upload images of diagrams from lectures, and the AI OCR feature extracts the text flawlessly. Pure magic." },
  { name: "Usman Ali", role: "Mathematics Major", text: "The AI quiz generator is the best study tool I've used. It creates perfect practice problems from my notes." },
  { name: "Sana Iqbal", role: "Chemistry Student", text: "The threaded comments make discussing complex topics with study groups incredibly efficient and organized." },
  { name: "Hamza Syed", role: "Economics Student", text: "I've tried every note-taking app out there. VPad is the first one that feels like it was actually built for students." },
  // Group 3
  { name: "Amina Jamil", role: "Design Student", text: "The visual organization and aesthetic of the platform make me actually want to open my notes and study." },
  { name: "Kamran Yousaf", role: "Biology Major", text: "Being able to pin important notes and favorite key subjects has saved me during finals week." },
  { name: "Nida Abbas", role: "Sociology Student", text: "I used to lose my notes all the time. Now everything is perfectly categorized by semester and subject." },
  { name: "Saad Qureshi", role: "Engineering Student", text: "The ability to export my rich notes to perfectly formatted PDFs is a game-changer for submitting assignments." },
  { name: "Rabia Khalid", role: "Medical Student", text: "Voice comments are amazing for quick feedback when studying anatomy diagrams with my peers." },
  { name: "Fahad Farooq", role: "Computer Science Student", text: "Fast, reliable, and looks gorgeous. VPad is exactly what a modern student workspace should be." }
];

const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Home() {
  const containerRef = useRef(null);
  const featuresRef = useRef(null);
  const featuresWrapperRef = useRef(null);
  const stackContainerRef = useRef(null);
  const cardsRef = useRef([]);

  useGSAP(() => {
    // Horizontal Pinned Scroll for Features
    const features = gsap.utils.toArray(".feature-card");
    if (features.length > 0 && window.innerWidth > 768) {
      gsap.to(features, {
        xPercent: -100 * (features.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: featuresWrapperRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (features.length - 1),
          end: () => "+=" + featuresWrapperRef.current.offsetWidth,
        }
      });
    }


  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-32 lg:py-40 min-h-screen flex items-center">
        {/* Background Graphic */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero_students_bg.png"
            alt="Students collaborating"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0118]/80 via-[#1a0a2e]/90 to-[#0d1b2a]" />
        </div>

        <AnimatedBackground variant="hero" showMesh showParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              {"Smart Notes for".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={wordVariants}
                  className="inline-block mr-[0.3em]"
                >
                  {word}
                </motion.span>
              ))}
              <span className="block mt-2">
                {"Modern Students".split(" ").map((word, i) => (
                  <motion.span
                    key={`g-${i}`}
                    custom={i + 3}
                    variants={wordVariants}
                    className="inline-block mr-[0.3em] gradient-text"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              VPad helps you organize, write, share, and collaborate on your
              academic notes. Elevate your study sessions with AI-powered insights, seamless LaTeX integration, and real-time multiplayer editing.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link
                to="/register"
                className="btn-primary btn-glow text-lg px-8 py-4 w-full sm:w-auto"
              >
                Get Started Free
              </Link>
              <Link to="/services" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto">
                Explore Features
              </Link>
            </motion.div>
          </motion.div>

          {/* Animated app preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-20 relative mx-auto max-w-5xl"
          >
            <div className="glass-card-glow overflow-hidden !p-0 border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)]">
              {/* Window chrome */}
              <div className="px-4 py-3 flex items-center space-x-2 bg-[#0f0a28]/80 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">VPad Dashboard</span>
                </div>
              </div>

              {/* Content area */}
              <div className="p-12 min-h-[400px] flex items-center justify-center relative overflow-hidden bg-[#0a0118]/60">
                <motion.div
                  className="absolute top-8 left-8 glass-card !p-3 text-xs text-gray-300 flex items-center gap-2 backdrop-blur-xl bg-white/5"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
                  3 collaborators online
                </motion.div>

                <motion.div
                  className="absolute bottom-8 right-8 glass-card !p-3 text-xs text-gray-300 backdrop-blur-xl bg-white/5"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <span className="mr-2">📝</span> Auto-saved just now
                </motion.div>

                <motion.div
                  className="absolute bottom-1/4 left-12 glass-card !p-3 text-xs text-gray-300 flex items-center gap-2 backdrop-blur-xl bg-white/5"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <PsychologyIcon style={{ fontSize: 16 }} className="text-primary-400" />
                  AI Summary ready
                </motion.div>

                <div className="text-center text-gray-500 relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], filter: ["drop-shadow(0 0 0px rgba(139,92,246,0))", "drop-shadow(0 0 20px rgba(139,92,246,0.3))", "drop-shadow(0 0 0px rgba(139,92,246,0))"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <AutoStoriesIcon
                      style={{ fontSize: 100 }}
                      className="mb-6 text-primary-500/60"
                    />
                  </motion.div>
                  <p className="text-xl font-medium text-gray-300">
                    Your interactive workspace
                  </p>
                  <motion.div
                    className="mt-4 flex items-center justify-center gap-2"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-sm font-medium text-primary-400 tracking-wide">Start typing</span>
                    <span className="w-0.5 h-5 bg-primary-400 inline-block shadow-[0_0_8px_#8b5cf6]" />
                  </motion.div>
                </div>

                {/* Decorative background grid inside mockup */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
              </div>
            </div>

            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl -z-10" />
          </motion.div>
        </div>

        {/* Section Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#130a2a] to-transparent z-10" />
      </section>

      {/* ── GSAP Pinned Features Section ── */}
      <section className="bg-[#130a2a] py-32 relative" ref={featuresWrapperRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              A Complete <span className="gradient-text">Ecosystem</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to capture, organize, and master your academic knowledge in one fluid interface.
            </p>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="overflow-hidden">
          <div className="flex md:w-[300vw] lg:w-[200vw]" ref={featuresRef}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card w-full md:w-1/3 lg:w-1/3 px-4 sm:px-6 lg:px-8 flex-shrink-0">
                  <GlassCard className="h-full min-h-[350px] flex flex-col justify-center bg-[#1a0f35]/50 border-white/5 hover:border-primary-500/30">
                    <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-8 shadow-glow">
                      <Icon className="text-white" style={{ fontSize: 32 }} />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0118] to-transparent z-10 pointer-events-none" />
      </section>

      {/* ── How it Works Section ── */}
      <section 
        className="py-32 relative bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('/vpad_parallax_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#0a0118]/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0118] via-transparent to-[#0a0118]" />

        <AnimatedBackground variant="particles" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              How VPad Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              A streamlined workflow designed to map perfectly to your academic structure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />

            {[
              { step: "01", title: "Setup Hierarchy", desc: "Create your Institution, add your current Semesters, and define your Subjects." },
              { step: "02", title: "Take Notes", desc: "Use our rich text editor with LaTeX support to craft beautiful, organized notes." },
              { step: "03", title: "Collaborate & AI", desc: "Share with peers in real-time and use AI to summarize complex topics instantly." }
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="w-24 h-24 mx-auto glass-card flex items-center justify-center rounded-full mb-8 relative z-10 border-primary-500/20 bg-[#160e30]">
                  <span className="text-3xl font-bold gradient-text">{item.step}</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 text-lg">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GSAP 3D Testimonials Stack ── */}
      <section className="py-32 bg-gradient-to-b from-[#0a0118] to-[#130a2a] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Loved by Students
            </h2>
            <p className="text-xl text-gray-400">
              See what your peers have to say about their experience with VPad.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 relative w-full overflow-hidden">
          {/* Fading edges properly aligned to the edges of the screen */}
          <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-[#0a0118] to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-[#130a2a] to-transparent z-10 pointer-events-none" />

          {[0, 1, 2].map((rowIndex) => {
            const group = rowIndex === 0
              ? testimonials.slice(0, 6)
              : rowIndex === 1
                ? testimonials.slice(6, 12)
                : testimonials.slice(12, 18);
            return (
              <div
                key={rowIndex}
                className="flex whitespace-nowrap animate-marquee"
                style={{
                  animationDirection: rowIndex % 2 === 0 ? 'normal' : 'reverse',
                  animationDuration: `${50 + rowIndex * 15}s`
                }}
              >
                {/* Repeat group to create seamless loop */}
                {[...group, ...group, ...group, ...group].map((t, i) => (
                  <div key={`${rowIndex}-${i}`} className="inline-block px-4 whitespace-normal">
                    <GlassCard className="w-[450px] p-8 border-white/5 bg-[#160e30]/80 hover:bg-[#1c1242] transition-all flex flex-col gap-6 rounded-3xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-semibold text-lg">{t.name}</h4>
                          <p className="text-primary-400 text-sm font-medium">{t.role}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-glow shrink-0">
                          {t.name.charAt(0)}
                        </div>
                      </div>
                      <p className="text-gray-300 leading-relaxed text-base font-light">
                        "{t.text}"
                      </p>
                    </GlassCard>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Parallax Banner Section ── */}
      <section
        className="relative py-40 overflow-hidden bg-fixed bg-center bg-cover"
        style={{ backgroundImage: "url('/vpad_parallax_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-[#0a0118]/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#130a2a] via-transparent to-[#130a2a]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
              Focus on <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-pink-500">Learning</span>
              <br />We Handle the Rest
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto drop-shadow-md">
              Experience the power of an intelligent, beautifully designed workspace built for the next generation of students.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative py-32 overflow-hidden bg-[#130a2a]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-secondary-700/10" />
        <AnimatedBackground variant="particles" showParticles />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card !p-16 border-white/10 bg-[#0a0118]/60"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Note-Taking?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of students who are already using VPad to organize
              their academic life and achieve better grades.
            </p>
            <Link
              to="/register"
              className="btn-primary btn-glow text-xl px-10 py-5 inline-block"
            >
              Start for Free Today
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
