"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest("/auth/reset-password", {
        method: "POST",
        body: {
          token,
          password
        }
      });
      login(response);
      router.push("/upload");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Create a new password"
      title="Choose a new password"
      description="Set a fresh password for your ResumeIQ account and continue directly into your workspace."
      asideTitle="A quick reset, then back to the work."
      asideDescription="Your account recovery flow keeps things secure while making it easy to return to resume editing and job targeting."
      asideItems={[
        "Reset links are short lived and tied to a single secure token.",
        "Your new session starts immediately after a successful reset.",
        "All older refresh sessions are revoked during the reset flow."
      ]}
      footer={
        <p className="text-sm text-slate-500">
          Need a fresh link?{" "}
          <Link href="/forgot-password" className="font-semibold text-tide">
            Request another
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="soft-tile flex flex-wrap gap-2 px-4 py-4">
          <span className="metric-pill">
            <KeyRound className="h-3.5 w-3.5 text-coral" />
            Token-protected reset
          </span>
          <span className="metric-pill">
            <ShieldCheck className="h-3.5 w-3.5 text-tide" />
            Older sessions revoked
          </span>
        </div>

        <label className="block">
          <span className="field-label">New password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field-input mt-2"
            placeholder="At least 8 characters"
            required
          />
          <p className="field-helper">Choose a fresh password you’re not reusing elsewhere.</p>
        </label>

        <label className="block">
          <span className="field-label">Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="field-input mt-2"
            placeholder="Repeat your new password"
            required
          />
          <p className="field-helper">Re-enter it once so ResumeIQ can update the session safely.</p>
        </label>

        {error ? <p className="inline-alert border-rose-100 bg-rose-50 text-rose-600">{error}</p> : null}

        <Button type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? "Resetting password..." : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
