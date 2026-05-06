import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store";
import toast from "react-hot-toast";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import GroupsIcon from "@mui/icons-material/Groups";
import AnimatedBackground from "../../components/ui/AnimatedBackground";
import BorderGlowDots from "../../components/ui/BorderGlowDots";

const fv = { hidden: { opacity: 0, x: 20 }, visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" } }) };

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (formData.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    try {
      const response = await register({ name: formData.name, email: formData.email, password: formData.password });
      const otpData = response?.data || {};
      sessionStorage.setItem("vpad_signup_email", otpData.email || formData.email);
      if (otpData.expiresAt) sessionStorage.setItem("vpad_signup_otp_expires_at", otpData.expiresAt);
      if (otpData.resendAvailableAt) sessionStorage.setItem("vpad_signup_otp_resend_at", otpData.resendAvailableAt);
      toast.success("Verification code sent. Check your email inbox.");
      navigate("/verify-email", { state: { email: otpData.email || formData.email, expiresAt: otpData.expiresAt, resendAvailableAt: otpData.resendAvailableAt } });
    } catch (error) { toast.error(error.response?.data?.message || "Registration failed"); }
  };

  const set = (k, v) => setFormData({ ...formData, [k]: v });

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center pt-28 pb-12 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl">
        <div className="relative rounded-3xl" style={{ isolation: "isolate" }}>
          <BorderGlowDots radius={24} duration={18} />
          <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
            <div className="relative lg:w-5/12 bg-gradient-to-br from-secondary-600 via-primary-500 to-primary-600 p-8 lg:p-10 flex flex-col justify-center overflow-hidden">
            <AnimatedBackground variant="auth" />
            <div className="relative z-10">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                <GroupsIcon className="text-white" style={{ fontSize: 32 }} />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">Join the VPad Community</h2>
              <p className="text-white/80 text-sm lg:text-base mb-6">Create your account and start collaborating with thousands of students worldwide.</p>
              <div className="hidden lg:flex flex-wrap gap-2">
                {["Free Forever", "Secure Notes", "Multilingual"].map((t) => <span key={t} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium">{t}</span>)}
              </div>
            </div>
          </div>
          <div className="lg:w-7/12 glass-auth lg:rounded-l-none">
            <div className="text-center lg:text-left mb-5">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto lg:mx-0 mb-3 lg:hidden"><span className="text-white font-bold text-xl">V</span></div>
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-gray-400 mt-1 text-sm">Start your learning journey with VPad</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div custom={0} variants={fv} initial="hidden" animate="visible">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                <div className="relative"><PersonIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fontSize="small" /><input type="text" value={formData.name} onChange={(e) => set("name", e.target.value)} className="input-glow pl-10" placeholder="John Doe" required minLength={2} /></div>
              </motion.div>
              <motion.div custom={1} variants={fv} initial="hidden" animate="visible">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <div className="relative"><EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fontSize="small" /><input type="email" value={formData.email} onChange={(e) => set("email", e.target.value)} className="input-glow pl-10" placeholder="you@example.com" required /></div>
              </motion.div>
              <motion.div custom={2} variants={fv} initial="hidden" animate="visible">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fontSize="small" />
                  <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => set("password", e.target.value)} className="input-glow pl-10 pr-10" placeholder="••••••••" required minLength={8} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">{showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}</button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must contain uppercase, lowercase, and number</p>
              </motion.div>
              <motion.div custom={3} variants={fv} initial="hidden" animate="visible">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
                <div className="relative"><LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fontSize="small" /><input type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} className="input-glow pl-10" placeholder="••••••••" required /></div>
              </motion.div>
              <motion.div custom={4} variants={fv} initial="hidden" animate="visible" className="flex items-start">
                <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-transparent" />
                <span className="ml-2 text-sm text-gray-400">I agree to the <Link to="/terms" className="text-primary-400 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-400 hover:underline">Privacy Policy</Link></span>
              </motion.div>
              <motion.div custom={5} variants={fv} initial="hidden" animate="visible">
                <button type="submit" disabled={isLoading} className="btn-primary btn-glow w-full flex items-center justify-center">{isLoading ? <div className="spinner w-5 h-5" /> : "Create Account"}</button>
              </motion.div>
            </form>
            <motion.div custom={6} variants={fv} initial="hidden" animate="visible" className="mt-5 text-center">
              <p className="text-gray-400 text-sm">Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link></p>
            </motion.div>
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
