import React, { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function ManagerSignUp() {
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
      <div>
        <h2>Verify Email</h2>
        {error && <p>{error}</p>}
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Verification Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit">Verify</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <h2>Manager Sign-Up</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={emailAddress}
          onChange={(e) => setEmailAddress(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
