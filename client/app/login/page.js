"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

const buildVerificationPath = (verificationUrl, email) => {
  if (verificationUrl) {
    try {
      const url = new URL(verificationUrl);
      return `${url.pathname}${url.search}`;
    } catch (error) {
      // Fall back to the generic verification screen if the URL is malformed.
    }
  }

  return `/verify-email?email=${encodeURIComponent(email)}`;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/upload";
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setDetails(null);
    setLoading(true);

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: form
      });
      login(response);
      router.push(nextPath);
    } catch (requestError) {
      if (requestError.status === 403) {
        router.push(buildVerificationPath(requestError.details?.verificationUrl, form.email));
        return;
      }

      setError(requestError.message);
      setDetails(requestError.details || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Return to your workspace"
      title="Sign in"
      description="Use your ResumeIQ account to continue scoring resumes, reviewing keyword gaps, and comparing job matches."
      asideTitle="Keep every application sharper than the last."
      asideDescription="ResumeIQ gives you one place to upload, analyze, refine, and track resume performance without losing the thread between applications."
      asideItems={[
        "Jump back into ATS score breakdowns, rewritten bullets, and saved share links.",
        "Compare new job descriptions against your resume before you apply.",
        "Refresh recommendations whenever your skills, projects, or target role changes."
      ]}
      footer={
        <>
          <p className="text-sm text-slate-500">
            New here?{" "}
            <Link href="/signup" className="font-semibold text-tide">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Forgot your password?{" "}
            <Link href="/forgot-password" className="font-semibold text-tide">
              Reset it
            </Link>
          </p>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="soft-tile flex flex-wrap gap-2 px-4 py-4">
          <span className="metric-pill">
            <LockKeyhole className="h-3.5 w-3.5 text-tide" />
            Private workspace
          </span>
          <span className="metric-pill">
            <Sparkles className="h-3.5 w-3.5 text-coral" />
            Resume history ready
          </span>
        </div>

        <label className="block">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="field-input mt-2"
            placeholder="you@example.com"
            required
          />
          <p className="field-helper">Use the same inbox connected to your saved analyses and share links.</p>
        </label>

        <label className="block">
          <span className="field-label">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="field-input mt-2"
            placeholder="Your password"
            required
          />
          <p className="field-helper">Your account opens directly into the active ResumeIQ workspace after sign-in.</p>
        </label>

        {error ? <p className="inline-alert border-rose-100 bg-rose-50 text-rose-600">{error}</p> : null}
        {details?.verificationUrl ? (
          <div className="inline-alert border-cyan-100 bg-mist text-tide">
            Development verification link:{" "}
            <Link className="font-semibold underline" href={details.verificationUrl}>
              Open verification page
            </Link>
          </div>
        ) : null}

        <Button type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
