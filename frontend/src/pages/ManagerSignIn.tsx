import React, { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function ManagerSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Error state now allows string or null
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId as string });
        navigate("/dashboard"); // Redirect to the desired page
      } else {
        setError(
          "Sign-in attempt is incomplete. Please check your credentials."
        );
      }
    } catch {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="text-center bg-white p-[30px] rounded-lg shadow-lg w-[380px] border-t-4 border-teal-500">
        <img src={logo} alt="App Logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-[28px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500 mb-4">
          Manager Sign-In</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 mb-4 border border-blue-500 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 mb-4 border border-blue-500 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleSignIn}
          className="w-full py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
