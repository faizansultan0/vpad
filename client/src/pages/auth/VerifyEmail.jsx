import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store";
import toast from "react-hot-toast";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";

const OTP_LENGTH = 6;
const OPTIMISTIC_RESEND_COOLDOWN_SECONDS = 30;

const secondsUntil = (dateLike) => {
  if (!dateLike) return 0;
  const target = new Date(dateLike).getTime();
  if (Number.isNaN(target)) return 0;
  const diff = target - Date.now();
  return diff > 0 ? Math.ceil(diff / 1000) : 0;
};

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, verifySignupOtp, resendSignupOtp, isLoading } =
    useAuthStore();
  const [status, setStatus] = useState(token ? "verifying" : "idle");
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [email] = useState(
    location.state?.email || sessionStorage.getItem("vpad_signup_email") || "",
  );
  const [expiresAt, setExpiresAt] = useState(
    location.state?.expiresAt ||
      sessionStorage.getItem("vpad_signup_otp_expires_at") ||
      null,
  );
  const [resendAvailableAt, setResendAvailableAt] = useState(
    location.state?.resendAvailableAt ||
      sessionStorage.getItem("vpad_signup_otp_resend_at") ||
      null,
  );
  const [resendSeconds, setResendSeconds] = useState(
    secondsUntil(
      location.state?.resendAvailableAt ||
        sessionStorage.getItem("vpad_signup_otp_resend_at"),
    ),
  );
  const [expirySeconds, setExpirySeconds] = useState(
    secondsUntil(
      location.state?.expiresAt ||
        sessionStorage.getItem("vpad_signup_otp_expires_at"),
    ),
  );
  const [isResendRequesting, setIsResendRequesting] = useState(false);
  const verificationAttempted = useRef(false);
  const resendRequestLock = useRef(false);

  useEffect(() => {
    if (!token) return;

    if (verificationAttempted.current) return;
    verificationAttempted.current = true;

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err.response?.data?.message || "Verification failed");
      }
    };
    verify();
  }, [token, verifyEmail]);

  useEffect(() => {
    if (token) return;

    const timer = setInterval(() => {
      setResendSeconds(secondsUntil(resendAvailableAt));
      setExpirySeconds(secondsUntil(expiresAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [token, resendAvailableAt, expiresAt]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("No signup email found. Please register again.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit verification code.");
      return;
    }

    try {
      await verifySignupOtp(email, otp);
      sessionStorage.removeItem("vpad_signup_email");
      sessionStorage.removeItem("vpad_signup_otp_expires_at");
      sessionStorage.removeItem("vpad_signup_otp_resend_at");
      toast.success("Email verified successfully");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  const handleResend = async () => {
    if (!email || resendSeconds > 0 || resendRequestLock.current) return;

    const previousResendAt = resendAvailableAt;
    const optimisticResendAt = new Date(
      Date.now() + OPTIMISTIC_RESEND_COOLDOWN_SECONDS * 1000,
    ).toISOString();

    resendRequestLock.current = true;
    setIsResendRequesting(true);
    setResendAvailableAt(optimisticResendAt);
    setResendSeconds(OPTIMISTIC_RESEND_COOLDOWN_SECONDS);
    sessionStorage.setItem("vpad_signup_otp_resend_at", optimisticResendAt);

    try {
      const response = await resendSignupOtp(email);
      const payload = response?.data || {};

      if (payload.resendAvailableAt) {
        setResendAvailableAt(payload.resendAvailableAt);
        sessionStorage.setItem(
          "vpad_signup_otp_resend_at",
          payload.resendAvailableAt,
        );
      }

      if (payload.expiresAt) {
        setExpiresAt(payload.expiresAt);
        sessionStorage.setItem("vpad_signup_otp_expires_at", payload.expiresAt);
      }

      setOtp("");
      setError("");
      toast.success("New verification code sent");
    } catch (err) {
      setResendAvailableAt(previousResendAt || null);
      setResendSeconds(secondsUntil(previousResendAt));
      if (previousResendAt) {
        sessionStorage.setItem("vpad_signup_otp_resend_at", previousResendAt);
      } else {
        sessionStorage.removeItem("vpad_signup_otp_resend_at");
      }
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      resendRequestLock.current = false;
      setIsResendRequesting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center pt-28 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(139, 92, 246, 0.15)" }}>
                <MarkEmailReadIcon className="text-primary-400" fontSize="large" />
              </div>
              <h1 className="text-2xl font-semibold text-white">
                Verify Your Email
              </h1>
              <p className="text-gray-400 mt-2">
                Enter the {OTP_LENGTH}-digit code sent to
              </p>
              <p className="font-medium text-white break-all">{email || "-"}</p>
            </div>

            {!email ? (
              <div className="text-center">
                <p className="text-red-400 mb-4">
                  Missing signup details. Please start registration again.
                </p>
                <Link to="/register" className="btn-primary inline-block">
                  Go to Sign Up
                </Link>
              </div>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={OTP_LENGTH}
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
                      setOtp(value);
                      if (error) setError("");
                    }}
                    className="input-glow text-center tracking-[0.6em] font-semibold text-lg"
                    placeholder={"0".repeat(OTP_LENGTH)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {expirySeconds > 0
                      ? `Code expires in ${expirySeconds}s`
                      : "Code expired. Please resend a new code."}
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-red-400 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.1)" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center"
                >
                  {isLoading ? <div className="spinner w-5 h-5" /> : "Verify Code"}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading || isResendRequesting || resendSeconds > 0}
                  className="btn-secondary w-full disabled:opacity-60"
                >
                  {isResendRequesting
                    ? "Sending new code..."
                    : resendSeconds > 0
                    ? `Resend Code in ${resendSeconds}s`
                    : "Resend Code"}
                </button>

                <div className="text-center text-sm text-gray-500">
                  Wrong email? <Link to="/register" className="text-primary-400">Register again</Link>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center pt-28 pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card text-center py-8">
          {status === "verifying" && (
            <>
              <div className="spinner w-12 h-12 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Verifying Email
              </h2>
              <p className="text-gray-400">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(34,197,94,0.15)" }}>
                <CheckCircleIcon style={{ color: "#4ade80" }} fontSize="large" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-400 mb-6">
                Your email has been successfully verified. You can now access
                all features of VPad.
              </p>
              <Link to="/dashboard" className="btn-primary inline-block">
                Go to Dashboard
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.15)" }}>
                <ErrorIcon style={{ color: "#f87171" }} fontSize="large" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <div className="space-x-4">
                <Link to="/login" className="btn-primary inline-block">
                  Sign In
                </Link>
                <Link to="/register" className="btn-secondary inline-block">
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
