import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store";
import toast from "react-hot-toast";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";
import AnimatedBackground from "../../components/ui/AnimatedBackground";

const fv = { hidden: { opacity: 0, x: 20 }, visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" } }) };

export default function ForgotPassword() {
  const { forgotPassword } = useAuthStore();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try { await forgotPassword(email); setEmailSent(true); toast.success("Password reset link sent to your email"); }
    catch (error) { toast.error(error.response?.data?.message || "Failed to send reset email"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center pt-28 pb-12 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl">
        <div className="flex flex-col lg:flex-row rounded-3xl overflow-hidden" style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}>
          <div className="relative lg:w-5/12 bg-gradient-to-br from-primary-600 via-secondary-500 to-primary-600 p-8 lg:p-10 flex flex-col justify-center overflow-hidden">
            <AnimatedBackground variant="auth" />
            <div className="relative z-10">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                <LockResetIcon className="text-white" style={{ fontSize: 32 }} />
              </motion.div>
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">Reset Your Password</h2>
              <p className="text-white/80 text-sm lg:text-base">Don't worry, we'll send you a secure link to reset your password.</p>
            </div>
          </div>
          <div className="lg:w-7/12 glass-auth lg:rounded-l-none">
            <div className="text-center lg:text-left mb-6">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto lg:mx-0 mb-3 lg:hidden"><span className="text-white font-bold text-xl">V</span></div>
              <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
              <p className="text-gray-400 mt-1 text-sm">{emailSent ? "Check your email for reset instructions" : "Enter your email to reset your password"}</p>
            </div>
            {emailSent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(34,197,94,0.15)" }}>
                  <EmailIcon style={{ color: "#4ade80" }} fontSize="large" />
                </motion.div>
                <p className="text-gray-300 mb-6">We've sent a password reset link to <strong className="text-white">{email}</strong>.</p>
                <p className="text-sm text-gray-500 mb-6">Didn't receive the email? Check your spam folder or try again.</p>
                <button onClick={() => setEmailSent(false)} className="btn-secondary">Try Again</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div custom={0} variants={fv} initial="hidden" animate="visible">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                  <div className="relative"><EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" fontSize="small" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glow pl-10" placeholder="you@example.com" required /></div>
                </motion.div>
                <motion.div custom={1} variants={fv} initial="hidden" animate="visible">
                  <button type="submit" disabled={isLoading} className="btn-primary btn-glow w-full flex items-center justify-center">{isLoading ? <div className="spinner w-5 h-5" /> : "Send Reset Link"}</button>
                </motion.div>
              </form>
            )}
            <motion.div custom={2} variants={fv} initial="hidden" animate="visible" className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center text-primary-400 hover:text-primary-300 text-sm"><ArrowBackIcon fontSize="small" className="mr-1" />Back to Sign In</Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
