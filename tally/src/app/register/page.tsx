'use client'

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Background from "@/components/Background";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-screen w-screen bg-white relative overflow-hidden flex items-center justify-center">
        <Background />
        <div className="max-w-md mx-auto w-full px-6">
          <div className="bg-white/90 backdrop-blur-2xl border border-green-200 rounded-3xl p-8 shadow-[0_8px_32px_rgba(34,197,94,0.15)]">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="font-sans text-2xl font-medium text-gray-900 mb-2">Account created!</h1>
              <p className="text-gray-700 font-inter">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-white relative overflow-hidden" style={{'--selection': 'rgba(68, 78, 170, 0.15)'} as React.CSSProperties}>
      <Background />

      <main className="flex items-center justify-center h-full px-6">
        <div className="max-w-md mx-auto w-full">
          {/* Register Card */}
          <div className="bg-white/90 backdrop-blur-2xl border border-[#444EAA]/20 rounded-3xl p-8 shadow-[0_8px_32px_rgba(68,78,170,0.15)]">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-sans text-3xl font-medium text-gray-900 mb-2 tracking-[-0.02em]">
                Create account
              </h1>
              <p className="font-inter text-gray-700 text-sm">
                Start managing your inventory today
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-inter">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2 font-inter">
                  Name (optional)
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2 font-inter">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-2 font-inter">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="Create a password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-inter text-sm font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-gray-700 mt-6 font-inter">
              Already have an account?{" "}
              <Link href="/login" className="text-[#444EAA] hover:text-[#444EAA]/80 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}