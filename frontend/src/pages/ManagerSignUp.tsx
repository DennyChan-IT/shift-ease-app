import { useEffect, useState } from "react";
import { Clerk } from "@clerk/clerk-js";
import { FiEye, FiEyeOff } from "react-icons/fi";
import logo from "../assets/logo.png";

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerk = new Clerk(pubKey);

const ManagerSignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Load Clerk client once on mount
    clerk.load().catch((err) => console.error("Error loading Clerk:", err));

    // Initialize sign-up flow
    const initializeClerk = async () => {
      const token = new URL(window.location.href).searchParams.get(
        "__clerk_ticket"
      );
      if (!token) {
        console.error("No __clerk_ticket found in URL");
        return;
      }

      const form = document.getElementById("sign-up-form");
      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData(form as HTMLFormElement);
          const password = formData.get("password") as string;

          try {
            const signUpAttempt = await clerk.client!.signUp.create({
              strategy: "ticket",
              ticket: token,
              password,
            });

            if (signUpAttempt.status === "complete") {
              await clerk.setActive({
                session: signUpAttempt.createdSessionId,
              });
              window.location.href = "/dashboard"; // Redirect to dashboard
            } else {
              console.error(
                "Sign-up incomplete:",
                JSON.stringify(signUpAttempt, null, 2)
              );
            }
          } catch (err) {
            console.error("Error during sign-up:", err);
          }
        });
      }
    };

    initializeClerk();
  }, []);

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
        <h2 className="text-left text-[14px] mb-0">Password</h2>
        <form id="sign-up-form">
          <div className="relative mb-4">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-black rounded"
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
};

export default ManagerSignUp;
