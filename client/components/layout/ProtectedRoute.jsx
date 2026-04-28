"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { initialized, isAuthenticated } = useAuth();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [initialized, isAuthenticated, pathname, router]);

  if (!initialized || !isAuthenticated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(247,250,252,0.82))] p-6 text-center shadow-[0_28px_68px_rgba(9,21,35,0.14)] backdrop-blur-2xl sm:rounded-[2.4rem] sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-tide">ResumeIQ</p>
          <h2 className="mt-4 text-3xl font-semibold text-ink">Securing your workspace</h2>
          <p className="mt-3 text-base text-slate-600">
            We&apos;re checking your session and preparing your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
