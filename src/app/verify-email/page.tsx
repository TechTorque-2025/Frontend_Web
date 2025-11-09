import { Suspense } from "react";
import VerifyEmailRedirect from "./VerifyEmailRedirect";

/**
 * This page redirects old email verification links from /verify-email?token=xxx
 * to the correct path /auth/verify-email?token=xxx
 */
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center theme-bg-primary">
          <p className="theme-text-muted">
            Redirecting to email verification...
          </p>
        </div>
      }
    >
      <VerifyEmailRedirect />
    </Suspense>
  );
}
