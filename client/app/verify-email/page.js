"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";
  const { login } = useAuth();
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [email, setEmail] = useState(emailParam);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setEmail(emailParam);
  }, [emailParam]);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest("/auth/verify-email", {
          method: "POST",
          body: { token }
        });
        login(response);
        setSuccess("Email verified successfully. Redirecting to your workspace...");
        window.setTimeout(() => {
          router.push("/upload");
        }, 1200);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [login, router, token]);

  const resendVerification = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await apiRequest("/auth/resend-verification", {
        method: "POST",
        body: { email }
      });
      setSuccess(response.debug?.verificationUrl
        ? `Verification email sent. Development link: ${response.debug.verificationUrl}`
        : response.message);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <AuthLayout
      eyebrow="Secure your account"
      title="Verify your email"
      description="Confirm your ResumeIQ account to unlock sign-in and keep your workspace recovery flow secure."
      asideTitle="One quick verification, then you’re in."
      asideDescription="Email verification protects account access while keeping the handoff into your upload workspace smooth."
      asideItems={[
        "Verification keeps password resets and sign-in recovery tied to the right inbox.",
        "When local SMTP is unavailable, development mode can still surface the link safely.",
        "After verification, ResumeIQ sends you straight into your active workspace."
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
      <div className="soft-tile mb-5 flex flex-wrap gap-2 px-4 py-4">
        <span className="metric-pill">
          <MailCheck className="h-3.5 w-3.5 text-coral" />
          Inbox confirmation
        </span>
        <span className="metric-pill">
          <ShieldCheck className="h-3.5 w-3.5 text-tide" />
          Recovery protection
        </span>
      </div>

      {loading ? <p className="inline-alert border-cyan-100 bg-mist text-tide">Verifying your email...</p> : null}
      {error ? <p className="inline-alert border-rose-100 bg-rose-50 text-rose-600">{error}</p> : null}
      {success ? <p className="inline-alert border-cyan-100 bg-mist text-tide">{success}</p> : null}

      {!token ? (
        <>
          <div className="soft-tile mt-6 px-4 py-4 text-sm leading-6 text-slate-600">
            {email ? `Check the inbox for ${email}.` : "Check your inbox for the verification link."} If it does not arrive, request a fresh one below.
          </div>

          <form className="mt-5 space-y-5" onSubmit={resendVerification}>
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
              <p className="field-helper">We’ll send a fresh verification link to this address.</p>
            </label>

            <Button type="submit" className="w-full justify-center">
              Send verification email
            </Button>
          </form>
        </>
      ) : null}
    </AuthLayout>
  );
}
