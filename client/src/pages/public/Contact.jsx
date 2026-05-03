import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/axios";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import SendIcon from "@mui/icons-material/Send";
import AnimatedBackground from "../../components/ui/AnimatedBackground";
import GlassCard from "../../components/ui/GlassCard";

const contactInfo = [
  { icon: EmailIcon, label: "Email", value: "vpad.official@gmail.com", href: "mailto:vpad.official@gmail.com" },
  { icon: LocationOnIcon, label: "Address", value: "Lahore, Pakistan", href: null },
  { icon: PhoneIcon, label: "Phone", value: "+92 300 1234567", href: "tel:+923001234567" },
];

const fieldVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" } }),
};

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/contacts", formData);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative py-20 overflow-hidden">
      <AnimatedBackground variant="minimal" showMesh />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Get in <span className="gradient-text">Touch</span></h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Have questions or feedback? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
            <GlassCard className="h-full" tilt={false}>
              <h2 className="text-xl font-semibold text-white mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info, idx) => {
                  const Icon = info.icon;
                  return (
                    <motion.div key={info.label} className="flex items-start space-x-4" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + idx * 0.1 }}>
                      <motion.div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0 shadow-glow" whileHover={{ scale: 1.1 }}>
                        <Icon className="text-white" fontSize="small" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-gray-500">{info.label}</p>
                        {info.href ? (
                          <a href={info.href} className="text-gray-200 hover:text-primary-400 transition-colors">{info.value}</a>
                        ) : (
                          <p className="text-gray-200">{info.value}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-8 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 className="font-semibold text-gray-200 mb-4">Office Hours</h3>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM (PKT)</p>
                  <p>Saturday: 10:00 AM - 4:00 PM (PKT)</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <div className="glass-card-glow">
              <h2 className="text-xl font-semibold text-white mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">Your Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="input-glow" placeholder="John Doe" />
                  </motion.div>
                  <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="input-glow" placeholder="john@example.com" />
                  </motion.div>
                </div>
                <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
                  <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className="input-glow" placeholder="How can we help?" />
                </motion.div>
                <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={6} className="input-glow resize-none" placeholder="Your message..." />
                </motion.div>
                <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
                  <button type="submit" disabled={isSubmitting} className="btn-primary btn-glow w-full sm:w-auto flex items-center justify-center space-x-2 disabled:opacity-50">
                    {isSubmitting ? <div className="spinner w-5 h-5" /> : <><SendIcon fontSize="small" /><span>Send Message</span></>}
                  </button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
