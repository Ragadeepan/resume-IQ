"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles } from "lucide-react";
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

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: form
      });
      if (response.token) {
        login(response);
        router.push("/upload");
        return;
      }

      if (response.requiresEmailVerification) {
        router.push(buildVerificationPath(response.debug?.verificationUrl, form.email));
        return;
      }

      setSuccess(response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Create your workspace"
      title="Open a ResumeIQ account"
      description="Start uploading resumes, tracking analysis history, and tailoring every application with stronger ATS signals."
      asideTitle="Build a resume workflow that feels like a control room."
      asideDescription="From upload to rewrite to role targeting, ResumeIQ keeps the entire improvement loop in one polished workspace."
      asideItems={[
        "Upload PDF or DOCX resumes and keep a clean analysis timeline.",
        "Get structured strengths, weaknesses, and bullet rewrites in seconds.",
        "Turn extracted skills into live job-search queries with missing-skill visibility."
      ]}
      footer={
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-tide">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="soft-tile flex flex-wrap gap-2 px-4 py-4">
          <span className="metric-pill">
            <Sparkles className="h-3.5 w-3.5 text-coral" />
            Takes under a minute
          </span>
          <span className="metric-pill">
            <ShieldCheck className="h-3.5 w-3.5 text-tide" />
            No card needed
          </span>
        </div>

        <label className="block">
          <span className="field-label">Full name</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="field-input mt-2"
            placeholder="Avery Johnson"
            required
          />
          <p className="field-helper">This name appears on your workspace and public report shares.</p>
        </label>

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
          <p className="field-helper">Use an inbox you can verify if email confirmation is enabled.</p>
        </label>

        <label className="block">
          <span className="field-label">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="field-input mt-2"
            placeholder="At least 8 characters"
            required
          />
          <p className="field-helper">Use 8+ characters so recovery and sign-in stay secure.</p>
        </label>

        {error ? <p className="inline-alert border-rose-100 bg-rose-50 text-rose-600">{error}</p> : null}
        {success ? (
          <div className="inline-alert border-cyan-100 bg-mist text-tide">
            <p>{success.message}</p>
            {success.debug?.verificationUrl ? (
              <p className="mt-2">
                Development verification link:{" "}
                <Link href={success.debug.verificationUrl} className="font-semibold underline">
                  Open verification page
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        <Button type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
