"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // Redirect to the correct verify-email page with token
      router.push(`/auth/verify-email?token=${token}`);
    } else {
      // No token provided, redirect to login
      router.push("/auth/login");
    }
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center theme-bg-primary">
      <p className="theme-text-muted">Redirecting to email verification...</p>
    </div>
  );
}
