import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, Loader } from "lucide-react";
import { login } from "../../store/slices/authSlice"; 

const LoginPage = () => {
  const dispatch = useDispatch();
  const { isLoggingIn, authUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Student",
  });

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
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    } else if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateForm()) {
    return;
  }
  // Send the plain object, not new FormData()
  dispatch(login(formData)); 
};

 useEffect(() => {
  if (authUser && authUser.role) { // Check authUser.role from Redux
    switch (authUser.role) {
      case "Student":
        navigate("/student");
        break;
      case "Teacher":
        navigate("/teacher");
        break;
      case "Admin":
        navigate("/admin");
        break;
      default:
        navigate("/login");
    }
  }
}, [authUser, navigate]);


return (
  <>
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
        
        <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500   mb-4">
          <BookOpen className="text-white w-8 h-8"/>
        </div>
        <h1 className="text-xl font-semibold"> Educational Project Management</h1>
        <p className="text-slate-600 mt-2">Sign in to your account</p>
      
        </div>
        {/* Login Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block mb-1 font-medium">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            {/* Email Input */}
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your mail"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error.email ? "border-red-500" : "border-gray-300"}`}
              />
              {error.email && <p className="text-red-500 text-sm mt-1">{error.email}</p>}   
            </div>
            {/* Password Field */}
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your Password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error.password ? "border-red-500" : "border-gray-300"}`}
              />
              {error.password && <p className="text-red-500 text-sm mt-1">{error.password}</p>}
            </div>
            {/* Forgot Password Link */}
            <div className="text-right">
              
              <a href="/forgot-password" className="text-sm  text-blue-500 hover:underline">Forgot Password?</a> 

            </div>
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center">
                    <Loader className="animate-spin mr-2"></Loader>
                    Logging In...
                  </div>

                ) : "Login"}
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  </>
);
};
export default LoginPage;
