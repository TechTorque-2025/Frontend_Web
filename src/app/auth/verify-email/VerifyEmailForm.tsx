"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import authService from "../../../services/authService";

const CheckCircleIcon = () => (
  <svg
    className="w-16 h-16 text-green-500 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const ExclamationIcon = () => (
  <svg
    className="w-16 h-16 text-red-500 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const SpinnerIcon = () => (
  <svg
    className="animate-spin w-16 h-16 text-blue-500 mb-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

export default function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyToken = async () => {
      console.log("Verify email page mounted. Token:", token);

      if (!token) {
        console.error("No token provided");
        setStatus("error");
        setMessage("No verification token provided. Invalid link.");
        return;
      }

      try {
        console.log("Calling authService.verifyEmail with token:", token);
        const response = await authService.verifyEmail(token);
        console.log("Verification successful. Response:", response);

        setStatus("success");
        setMessage("Email verified successfully! You can now log in.");

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } catch (err: unknown) {
        console.error("Verification failed. Error:", err);
        setStatus("error");
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Email verification failed. The link may be expired or invalid.";
        console.error("Error message:", errorMessage);
        setMessage(errorMessage);
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="text-center">
      {status === "loading" && (
        <>
          <SpinnerIcon />
          <h2 className="text-3xl font-black theme-text-primary mb-4">
            Verifying Email
          </h2>
          <p className="text-lg theme-text-muted">{message}</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircleIcon />
          <h2 className="text-3xl font-black theme-text-primary mb-4">
            Email Verified!
          </h2>
          <p className="text-lg theme-text-muted mb-6">{message}</p>
          <p className="text-sm theme-text-muted mb-6">
            Redirecting to login page in 3 seconds...
          </p>
          <Link
            href="/auth/login"
            className="theme-button-primary inline-block"
          >
            Go to Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <ExclamationIcon />
          <h2 className="text-3xl font-black text-red-600 dark:text-red-400 mb-4">
            Verification Failed
          </h2>
          <p className="text-lg theme-text-muted mb-6">{message}</p>
          <div className="space-y-3">
            <Link
              href="/auth/register"
              className="theme-button-primary inline-block"
            >
              Register Again
            </Link>
            <p className="text-sm theme-text-muted">
              or{" "}
              <Link
                href="/auth/login"
                className="text-blue-500 hover:underline"
              >
                go back to login
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
