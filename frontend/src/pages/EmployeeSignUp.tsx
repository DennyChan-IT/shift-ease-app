import { useState, useEffect } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function EmployeeSignUp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Extract ticket from URL once
  const ticket =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("__clerk_ticket")
      : null;

  useEffect(() => {
    if (!ticket) {
      console.error("No __clerk_ticket found in URL");
    }
  }, [ticket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !ticket) return;

    try {
      // Create sign-up via invitation ticket
      const signUpAttempt = await signUp.create({
        strategy: "ticket",
        ticket,
        password,
      });

      if (signUpAttempt.status === "complete") {
        // Activate session
        await setActive({ session: signUpAttempt.createdSessionId! });
        // Redirect after success
        navigate("/dashboard");
      } else {
        console.error("Sign-up incomplete:", signUpAttempt);
      }
    } catch (err) {
      console.error("Error during sign-up:", err);
    }
  };

  if (!isLoaded) {
    return <p>Loading Clerk...</p>;
  }
  if (!ticket) {
    return <p>Invalid invitation link.</p>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="w-[30vw] text-center bg-white p-[30px] rounded-lg shadow-lg border-t-4 border-black">
        <img src={logo} alt="App Logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-[28px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-black mb-2">
          Welcome to ShiftEase App
        </h2>
        <p className="text-[14px] mb-4">
          Let's create your account so you can start seeing your schedule
        </p>
        <form id="sign-up-form" onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-black rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-black text-white font-semibold rounded hover:bg-gray-800 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
