import React, { useContext, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../components/inputs/input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths"; // <-- FIX #1: Added missing import
import { UserContext } from "../../context/userContext";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const {updateUser}= useContext(UserContext)
  const navigate = useNavigate();

  // Handle Login Form Submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please Enter valid Email adress.");
      return;
    }

    if (!password) {
      setError("Please Enter valid Password.");
      return;
    }

    setError("");

    // FIX #2: The API call logic is now correctly placed INSIDE the handleLogin function
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data)

        // Redirect based on role
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went Wrong. Please try again.");
      }
    }
  }; // <-- The handleLogin function now correctly ends here

  const handleGoogleSignIn = () => {
    // This will redirect the user to your backend, which then sends them to Google
    window.location.href = "http://localhost:8000/api/auth/google-signin";
  };

  // FIX #3: The return statement is now correctly placed in the component body
  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Please enter your details to log in
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="atharva@example.com"
            type="text"
          />

          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Min 8 char"
            type="password"
          />

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">
            LOGIN
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Don't have an account?{" "}
            <Link className="font-medium text-primary underline" to="/signup">
              SignUp
            </Link>
          </p>
        </form>

        {/* Separator */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="text-slate-500 text-xs">OR</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Google Sign-in Button */}
        <button 
          onClick={handleGoogleSignIn} 
          className="w-full flex items-center justify-center gap-3 card-btn"
        >
          <FcGoogle className="text-xl" />
          Sign in with Google
        </button>
        
      </div>
    </AuthLayout>
  );
};

export default Login;