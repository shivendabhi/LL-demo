'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Background from "@/components/Background";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else {
        // NextAuth will handle the session update
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-white relative overflow-hidden">
      <Background />

      <main className="flex items-center justify-center h-full px-6">
        <div className="max-w-md mx-auto w-full">
          {/* Login Card */}
          <div className="bg-white/90 backdrop-blur-2xl border border-[#444EAA]/20 rounded-3xl p-8 shadow-[0_8px_32px_rgba(68,78,170,0.15)]">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-sans text-3xl font-medium text-gray-900 mb-2 tracking-[-0.02em]">
                Welcome back
              </h1>
              <p className="font-inter text-gray-700 text-sm">
                Sign in to your Tally account
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2 font-inter">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-inter text-sm focus:outline-none text-gray-500 focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white/80 backdrop-blur-sm"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl font-inter text-sm focus:outline-none text-gray-500 focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-inter text-sm font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-gray-700 mt-6 font-inter">
              Don't have an account?{" "}
              <Link href="/register" className="text-[#444EAA] hover:text-[#444EAA]/80 transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}