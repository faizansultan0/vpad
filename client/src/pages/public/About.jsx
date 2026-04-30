import { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AnimatedBackground from "../../components/ui/AnimatedBackground";
import AnimatedCounter from "../../components/ui/AnimatedCounter";
import GlassCard from "../../components/ui/GlassCard";

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { label: "Active Users", value: "10,000+" },
  { label: "Notes Created", value: "50,000+" },
  { label: "Institutions", value: "500+" },
  { label: "Countries", value: "25+" },
];

const values = [
  { icon: SchoolIcon, title: "Education First", description: "We believe in making quality education accessible to everyone through better tools." },
  { icon: GroupsIcon, title: "Collaboration", description: "Learning is better together. We enable seamless collaboration between students." },
  { icon: TrendingUpIcon, title: "Continuous Improvement", description: "We constantly evolve our platform based on student feedback and needs." },
  { icon: FavoriteIcon, title: "Student-Centric", description: "Every feature we build is designed with students in mind." },
];

const timeline = [
  { year: "2023", title: "The Idea", description: "VPad started as a college project to solve our own disorganized notes." },
  { year: "2024", title: "First Launch", description: "Released beta version to 500 students across 3 universities." },
  { year: "2025", title: "AI Integration", description: "Added AI summarization and smart organization features." },
  { year: "2026", title: "Global Reach", description: "Expanded to support multiple languages and international students." }
];

export default function About() {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  useGSAP(() => {
    // Timeline Scroll Reveal
    const items = gsap.utils.toArray(".timeline-item");
    const line = document.querySelector(".timeline-line-fill");

    if (items.length > 0 && line) {
      gsap.to(line, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: timelineRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
        }
      });

      items.forEach((item, i) => {
        gsap.fromTo(item, 
          { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.8,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
            }
          }
        );
      });
    }
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="bg-[#0a0118]">
      {/* ── Hero ── */}
      <div className="relative py-32 lg:py-40 overflow-hidden">
        <AnimatedBackground variant="particles" showParticles showMesh />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 tracking-tight">
              About <span className="gradient-text">VPad</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              VPad was born from a simple idea: students deserve better tools for
              managing their academic notes. We're building the future of
              collaborative learning.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative mb-20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 rounded-3xl blur-xl" />
            <div className="relative rounded-3xl p-10 sm:p-16 overflow-hidden glass-card-glow border border-white/10 bg-[#130a2a]/60">
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-10">
                {stats.map((stat, index) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className="text-center">
                    <AnimatedCounter value={stat.value} duration={2} className="text-4xl sm:text-5xl font-bold text-white mb-3 block drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                    <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Mission ── */}
      <section className="py-32 relative bg-[#130a2a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Our Mission</h2>
          <div className="glass-card-glow gradient-border-animated !p-10 sm:!p-16 bg-[#0a0118]/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <p className="text-2xl text-gray-300 leading-relaxed text-center font-light italic">
              "To empower students worldwide with intelligent note-taking tools that enhance their learning experience. We believe that organized, accessible, and collaborative notes are the foundation of academic success."
            </p>
          </div>
        </div>
      </section>

      {/* ── GSAP Timeline ── */}
      <section className="py-32 relative bg-[#0a0118]" ref={timelineRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold text-white text-center mb-20">Our Story</h2>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Center Line */}
            <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-white/5 -translate-x-1/2 rounded-full overflow-hidden">
               <div className="timeline-line-fill w-full h-0 gradient-bg" />
            </div>

            {timeline.map((item, index) => (
              <div key={index} className={`timeline-item flex flex-col md:flex-row items-center justify-between mb-16 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:block w-5/12" />
                <div className="absolute left-[20px] md:left-1/2 w-4 h-4 rounded-full gradient-bg -translate-x-1/2 shadow-[0_0_10px_#8b5cf6] z-10" />
                <GlassCard className="w-[calc(100%-50px)] ml-[50px] md:ml-0 md:w-5/12 p-8 border-white/10 bg-[#1a0f35]/50 hover:bg-[#1a0f35]/80 transition-colors">
                  <span className="text-primary-400 font-bold text-xl mb-2 block">{item.year}</span>
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-32 relative bg-gradient-to-b from-[#130a2a] to-[#0a0118]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div key={value.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <GlassCard className="text-center h-full p-8 border-white/5 bg-[#160e30]/50 hover:border-primary-500/30">
                    <motion.div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6 shadow-glow" whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                      <Icon className="text-white" fontSize="large" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{value.description}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
