import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, ArrowLeft, Loader, KeyRound, RefreshCw } from "lucide-react";
import { forgotPassword } from "../../store/slices/authSlice"; 
// import { toast } from "react-toastify"; 

const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  
  // FIX: Access isRequestingForToken from state, DO NOT import it
  const { isRequestingForToken } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // States for the Success View (Timer & Resend)
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Timer Logic for Resend Button
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");

    try {
      // Dispatch Redux Action
      await dispatch(forgotPassword(email)).unwrap(); // Just pass email string based on your Thunk
      setIsSubmitted(true);
      setTimer(60); 
    } catch (err) {
      // Error is handled by toast in Thunk, but we set local error too for UI
      setError(err?.message || "Something went wrong.");
    }
  };

  // Handle Resend Logic
  const handleResend = async () => {
    if (timer > 0) return;
    setIsResending(true);
    try {
      await dispatch(forgotPassword(email)).unwrap();
      // Toast is handled in the slice
      setTimer(60);
    } catch (err) {
      // Toast handled in slice
      console.log(err);
    } finally {
      setIsResending(false);
    }
  };

  // --- VIEW 1: SUCCESS STATE (Check Your Email) ---
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
          
          {/* Animated Icon */}
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
          
          <p className="text-gray-600 mb-6">
            We have sent a password reset link to <br />
            <span className="font-semibold text-gray-800">{email}</span>
          </p>

          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <p>Didn't receive the email?</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Check your spam or junk folder.</li>
              <li>Wait a few minutes (it might be delayed).</li>
            </ul>
          </div>

          {/* Resend Button */}
          <div className="mb-8">
            <button
              onClick={handleResend}
              disabled={timer > 0 || isResending}
              className={`flex items-center justify-center mx-auto text-sm font-medium transition-colors ${
                timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800 hover:underline"
              }`}
            >
              {isResending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" /> Sending...
                </>
              ) : timer > 0 ? (
                `Resend email in ${timer}s`
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" /> Click to resend email
                </>
              )}
            </button>
          </div>

          <Link to="/login" className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // --- VIEW 2: FORM STATE (Enter Email) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <KeyRound className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2 text-sm">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                error ? "border-red-500 focus:ring-red-200" : "border-gray-300"
              }`}
              placeholder="Enter your email"
              disabled={isRequestingForToken}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isRequestingForToken}
            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            {isRequestingForToken ? (
              <div className="flex items-center justify-center">
                <Loader className="animate-spin mr-2 h-5 w-5" />
                Sending Link...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;