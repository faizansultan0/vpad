import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store";
import toast from "react-hot-toast";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import AnimatedBackground from "../../components/ui/AnimatedBackground";
import BorderGlowDots from "../../components/ui/BorderGlowDots";

const fieldVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }),
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center pt-28 pb-12 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl">
        <div className="relative rounded-3xl" style={{ isolation: "isolate" }}>
          <BorderGlowDots radius={24} duration={18} />
          <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
          {/* Left panel */}
          <div className="relative lg:w-5/12 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 p-8 lg:p-10 flex flex-col justify-center overflow-hidden">
            <AnimatedBackground variant="auth" />
            <div className="relative z-10">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                <AutoStoriesIcon className="text-white" style={{ fontSize: 32 }} />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">Welcome back to VPad</h2>
              <p className="text-white/80 text-sm lg:text-base mb-6">Your smart notes are waiting. Sign in to continue your learning journey.</p>
              <div className="hidden lg:flex flex-wrap gap-2">
                {["AI Summaries", "Real-time Collab", "Math Equations"].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:w-7/12 glass-auth lg:rounded-l-none">
            <div className="text-center lg:text-left mb-6">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto lg:mx-0 mb-3 lg:hidden"><span className="text-white font-bold text-xl">V</span></div>
              <h1 className="text-2xl font-bold text-white">Sign In</h1>
              <p className="text-gray-400 mt-1 text-sm">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fontSize="small" />
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-glow pl-10" placeholder="you@example.com" required />
                </div>
              </motion.div>
              <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fontSize="small" />
                  <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-glow pl-10 pr-10" placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </button>
                </div>
              </motion.div>
              <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-transparent" />
                  <span className="ml-2 text-sm text-gray-400">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">Forgot password?</Link>
              </motion.div>
              <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                <button type="submit" disabled={isLoading} className="btn-primary btn-glow w-full flex items-center justify-center">
                  {isLoading ? <div className="spinner w-5 h-5" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} /> : "Sign In"}
                </button>
              </motion.div>
            </form>

            <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible" className="mt-6 text-center">
              <p className="text-gray-400 text-sm">Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Sign up</Link></p>
            </motion.div>
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
