import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      setMessage("Check your inbox for password reset instructions.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reset password. Check the email address entered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 text-neutral-900">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-8 left-8 flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:border-neutral-300 shadow-sm transition-all duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-bold tracking-tight text-neutral-900 mb-6">
            <span className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-light">Lanzy</span>
          </Link>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">Reset Password</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Enter your email to receive a password reset link
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-neutral-700">
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
              className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors font-semibold py-2.5 rounded-md shadow-sm"
            >
              {loading ? "Sending link..." : "Send reset link"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Remember your password?{" "}
          <Link to="/login" className="font-medium text-brand-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
