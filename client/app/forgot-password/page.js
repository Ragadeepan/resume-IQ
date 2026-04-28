"use client";

import { useState } from "react";
import Link from "next/link";
import { LifeBuoy, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const response = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: { email }
      });
      setSuccess(response);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email and ResumeIQ will send a reset link so you can get back into your workspace."
      asideTitle="Recovery should feel calm, not confusing."
      asideDescription="Your analysis history and active sessions stay protected while you reset access and continue working."
      asideItems={[
        "Password recovery uses single-use tokens and short-lived reset links.",
        "You can jump right back into uploads, dashboards, and job targeting after reset.",
        "Local development mode can still preview the reset link when SMTP is not configured."
      ]}
      footer={
        <p className="text-sm text-slate-500">
          Back to{" "}
          <Link href="/login" className="font-semibold text-tide">
            sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="soft-tile flex flex-wrap gap-2 px-4 py-4">
          <span className="metric-pill">
            <LifeBuoy className="h-3.5 w-3.5 text-coral" />
            Single-use reset
          </span>
          <span className="metric-pill">
            <ShieldCheck className="h-3.5 w-3.5 text-tide" />
            Short-lived access
          </span>
        </div>

        <label className="block">
          <span className="field-label">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field-input mt-2"
            placeholder="you@example.com"
            required
          />
          <p className="field-helper">We’ll send a one-time recovery link to this inbox.</p>
        </label>

        {error ? <p className="inline-alert border-rose-100 bg-rose-50 text-rose-600">{error}</p> : null}
        {success ? (
          <div className="inline-alert border-cyan-100 bg-mist text-tide">
            <p>{success.message}</p>
            {success.debug?.resetUrl ? (
              <p className="mt-2">
                Development reset link:{" "}
                <Link href={success.debug.resetUrl} className="font-semibold underline">
                  Open reset page
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        <Button type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? "Sending reset link..." : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
