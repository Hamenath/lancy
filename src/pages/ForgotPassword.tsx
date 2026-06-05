import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage("Check your inbox for further instructions.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black px-4 py-12 text-white">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-8 left-8 flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/45 px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white hover:border-neutral-700 backdrop-blur-xl transition-all duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-900 bg-neutral-950/50 p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-bold tracking-tight text-white mb-6">
            <img src="/lancylogo.png" alt="Lanzy Logo" className="h-6 w-auto" />
            <span className="font-extrabold text-lg tracking-tight">Lanzy</span>
          </Link>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Reset Password</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-950/50 border border-red-900 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-green-950/50 border border-green-900 p-4 text-sm text-green-400">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-neutral-300">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 shadow-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-white text-black hover:bg-neutral-200 transition-colors font-semibold py-2.5 rounded-md"
            >
              {loading ? "Sending link..." : "Send reset link"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
