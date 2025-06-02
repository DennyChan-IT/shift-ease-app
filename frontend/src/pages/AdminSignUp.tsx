import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function AdminSignUp() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  // Handle sign-up form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    try {
      // Initiate sign-up with email and password
      await signUp.create({
        emailAddress,
        password,
      });

      // Send verification code to the user's email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      // Move to verification step
      setVerifying(true);
    } catch {
      setError("Sign-up failed. Please check your details and try again.");
    }
  };

  // Handle verification code submission
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoaded) return;

    try {
      // Attempt verification using the provided code
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        // Activate session and redirect if verification is successful
        await setActive({ session: signUpAttempt.createdSessionId });
        navigate("/home"); // Redirect to the dashboard or home page
      } else {
        setError("Verification incomplete. Please check your code.");
      }
    } catch {
      setError("Invalid code. Please try again.");
    }
  };

  // Render verification form if in verification step
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
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 mb-4">Admin Sign-Up</h2>
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
