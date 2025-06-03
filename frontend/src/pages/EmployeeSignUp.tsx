import React, { useEffect } from "react";
import { Clerk } from "@clerk/clerk-js";
import logo from "../assets/logo.png";

const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerk = new Clerk(pubKey);

await clerk.load();

const EmployeeSignUp: React.FC = () => {
  useEffect(() => {
    const initializeClerk = async () => {
      const param = "__clerk_ticket";
      const token = new URL(window.location.href).searchParams.get(param);

      const form = document.getElementById("sign-up-form");
      if (form) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const formData = new FormData(form as HTMLFormElement);
          const password = formData.get("password") as string;

          try {
            const signUpAttempt = await clerk.client.signUp.create({
              strategy: "ticket",
              ticket: token,
              password,
            });

            if (signUpAttempt.status === "complete") {
              await clerk.setActive({ session: signUpAttempt.createdSessionId });
              window.location.href = "/dashboard"; // Redirect to dashboard
            } else {
              console.error(JSON.stringify(signUpAttempt, null, 2));
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
      <div className="w-[30vw] text-center bg-white p-[30px] rounded-lg shadow-lg w-[380px] border-t-4 border-teal-500">
      <img src={logo} alt="App Logo" className="w-24 mx-auto mb-4" />
      <h2 className="text-[28px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">
      Welcome to ShiftEase App</h2>
      <p className="text-[14px] mb-4">Let's create your account so you can start seeing your schedule</p>
      <h2 className="text-[18px] flex justify-left text-[14px] mb-0">Password</h2>
        <form id="sign-up-form">
          <input
            name="password"
            type="password"
            placeholder="Enter your password"
            className="w-full px-3 py-2 mb-4 border border-blue-500 rounded"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeSignUp;
