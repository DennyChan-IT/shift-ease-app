import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function EmployeeSignUp() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const handleCheckEmail = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/employees/${emailAddress}`
      );
      const data = await response.json();
      if (!data.exists) {
        setError("Email not authorized for sign-up. Contact your admin.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking email:", error);
      setError("Failed to verify email. Try again later.");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    // Step 1: Check if the email exists in the database
    const isAuthorized = await handleCheckEmail();
    if (!isAuthorized) return;

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch {
      setError("Sign-up failed. Please try again.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        navigate("/home");
      } else {
        setError("Verification failed. Check your code and try again.");
      }
    } catch {
      setError("Invalid verification code.");
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="text-center bg-white p-[30px] rounded-lg shadow-lg w-[380px] border-t-4 border-teal-500">
          <img src={logo} alt="App Logo" className="w-24 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 mb-4 mb-4">
            Verify Email
          </h2>
          {error && <p className="text-red-500">{error}</p>}
          <form onSubmit={handleVerify}>
            <label htmlFor="code">Enter your verification code</label>
            <input
              id="code"
              name="code"
              type="text"
              className="w-full px-3 py-2 mb-4 border border-blue-500 rounded"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render initial sign-up form
  return (
    <div className="flex items-center justify-center h-screen bg-blue-100">
      <div className="text-center bg-white p-[30px] rounded-lg shadow-lg w-[380px] border-t-4 border-teal-500">
        <img src={logo} alt="App Logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 mb-4">
          Manager Sign-Up
        </h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Enter email address</label>
          <input
            id="email"
            type="email"
            name="email"
            className="w-full px-3 py-2 mb-4 border border-blue-500 rounded"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
          <label htmlFor="password">Enter password</label>
          <input
            id="password"
            type="password"
            name="password"
            className="w-full px-3 py-2 mb-4 border border-blue-500 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
