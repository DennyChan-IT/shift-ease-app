import { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import logo from "../assets/logo.png";

export default function ManagerSignIn() {
  const [email, setEmail] = useState("emily.chen@example.com");
  const [password, setPassword] = useState("shiftease");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null); // Error state now allows string or null
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!isLoaded) return;

    try {
      // 1) Look up the role by email
      const roleResp = await fetch("/api/public/check-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!roleResp.ok) {
        alert(
          "Your email address has not been registered in our system. Please contact your employer or system administrator to request access."
        );
        return;
      }

      const { role } = await roleResp.json();
      if (role !== "Manager") {
        alert("You don’t have Manager access.");
        return;
      }
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
      <div className="text-center bg-white p-[30px] rounded-lg shadow-lg w-[380px] border-t-4 border-black">
        <img src={logo} alt="App Logo" className="w-24 mx-auto mb-4" />
        <h2 className="text-[28px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-black mb-4">
          Manager Sign-In
        </h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 mb-4 border border-black rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-3 py-2 border border-black rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          onClick={handleSignIn}
          className="w-full py-2 bg-black text-white font-semibold rounded hover:bg-gray-800 transition"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
