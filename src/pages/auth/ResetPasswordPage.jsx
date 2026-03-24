import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, ArrowLeft, Loader } from "lucide-react";
import { resetPassword } from "../../store/slices/authSlice";
const ResetPasswordPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const { password, confirmPassword } = formData;
  const { isupdatingPassword } = useSelector((state) => state.auth);
  const [error, setError] = useState({});
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error && error[name]) {
      setError((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    // Dispatch Redux Action to reset password
    try {
      await dispatch(
        resetPassword({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      ).unwrap();
      // navigate to login page upon success
      navigate("/login");
    } catch (err) {
      // Handle error (e.g., show toast notification)
      setError({ general: err?.message || "Something went wrong. Please try again." });
    }
  };
  return <>
     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        
        <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500   mb-4">
          <KeyRound className="text-white w-8 h-8"/>
        </div>
        <h1 className="text-xl font-semibold">Reset Password</h1>
        <p className="text-slate-600 mt-2">Enter your new password below</p>
      
        </div>
        {/* Reset Password Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
           
            {/* New Password field */}
            <div>
              <label className="block mb-1 font-medium">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your new password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error.password ? "border-red-500" : "border-gray-300"}`}
              />
              {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}   
            </div>
            {/* Confirm Password Field */}
            <div>
              <label className="block mb-1 font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error.confirmPassword ? "border-red-500" : "border-gray-300"}`}
              />
              {error.confirmPassword && <p className="text-red-500 text-sm mt-1">{error.confirmPassword}</p>}
            </div>
            
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isupdatingPassword}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isupdatingPassword ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin mr-2"></Loader>
                    Updating Password...
                  </div>

                ) : "Reset Password"}
              </button>
            </div>
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
    </div>
  </>;
};

export default ResetPasswordPage;
