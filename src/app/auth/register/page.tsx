"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import authService from "../../../services/authService";
import ThemeToggle from "../../components/ThemeToggle";

// Icon Components
const Icon = ({ d, size = 10 }: { d: string; size?: number }) => (
  <svg
    className={`w-${size} h-${size} text-white`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
const BoltIcon = ({ size = 10 }) => (
  <Icon d="M13 10V3L4 14h7v7l9-11h-7z" size={size} />
);
const UserPlusIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
);
const EyeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);
const EyeOffIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z M15 12a3 3 0 11-6 0 3 3 0 016 0z M3 3l18 18"
    />
  </svg>
);

// --- Register Page Component ---
export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      address: formData.address,
    };
    try {
      await authService.register(payload);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg-primary font-sans">
      {/* Header */}
      <header className="sticky-header shadow-lg border-b theme-border">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                <BoltIcon size={6} />
              </div>
              <h1 className="text-2xl font-bold theme-text-primary hidden sm:block">
                TechTorque Auto
              </h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="theme-text-muted hidden md:inline">
                Already have an account?
              </span>
              <Link href="/auth/login" className="theme-button-secondary">
                Sign In
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 automotive-hero">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10"></div>
        <div className="w-full max-w-lg relative z-10">
          <div className="automotive-card p-8 md:p-12">
            {success ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                  <svg
                    className="h-8 w-8 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold theme-text-primary mb-2">
                  Account Created!
                </h2>
                <p className="text-base theme-text-secondary mb-2">
                  Welcome to TechTorque Auto, {formData.fullName}!
                </p>
                <p className="text-sm theme-text-muted">
                  A verification email has been sent to {formData.email}. Please
                  verify your email to log in.
                </p>
                <p className="mt-6 text-sm theme-text-muted animate-pulse">
                  Redirecting to login...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-4xl font-black theme-text-primary">
                    Create an Account
                  </h2>
                  <p className="mt-4 text-lg theme-text-muted">
                    Join us to streamline your vehicle care.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="theme-form-group">
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-semibold theme-text-secondary mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="theme-input w-full"
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                  <div className="theme-form-group">
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold theme-text-secondary mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="theme-input w-full"
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>
                  <div className="theme-form-group">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold theme-text-secondary mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="theme-input w-full"
                      placeholder="+1 (555) 000-0000"
                      disabled={loading}
                    />
                  </div>
                  <div className="theme-form-group">
                    <label
                      htmlFor="address"
                      className="block text-sm font-semibold theme-text-secondary mb-2"
                    >
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="theme-input w-full"
                      placeholder="123 Main St, City, State 12345"
                      disabled={loading}
                    />
                  </div>
                  <div className="theme-form-group">
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold theme-text-secondary"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-sm theme-text-muted hover:theme-text-secondary transition"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="theme-input w-full"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>
                  <div className="theme-form-group">
                    <div className="flex justify-between items-center mb-2">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-semibold theme-text-secondary"
                      >
                        Confirm Password
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-sm theme-text-muted hover:theme-text-secondary transition"
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="theme-input w-full"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="theme-button-primary w-full text-lg font-semibold py-4 rounded-xl flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <UserPlusIcon />
                      {loading ? "Creating Account..." : "Create Account"}
                    </button>
                  </div>
                </form>
              </>
            )}

            <p className="mt-8 text-center text-sm theme-text-muted">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold theme-link hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
