import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export default function VerifyEmail() {
  const { token } = useParams();
  const { verifyEmail } = useAuthStore();
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");
  const verificationAttempted = useRef(false);

  useEffect(() => {
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

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card text-center py-8">
          {status === "verifying" && (
            <>
              <div className="spinner w-12 h-12 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verifying Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="text-green-600" fontSize="large" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-6">
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
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <ErrorIcon className="text-red-600" fontSize="large" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
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
