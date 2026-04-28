"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileUp, ShieldCheck, Sparkles, Target } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiRequest } from "@/lib/api";
import { setLastResumeId } from "@/lib/storage";

export default function UploadPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please choose a PDF or DOCX resume.");
      return;
    }

    setError("");
    setWarning("");
    setLoading(true);
    setStatus("Uploading and parsing your resume...");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const uploadResponse = await apiRequest("/upload", {
        method: "POST",
        token,
        body: formData
      });

      if (uploadResponse.warning) {
        setWarning(uploadResponse.warning);
      }

      const resumeId = uploadResponse.resume.id;
      setLastResumeId(resumeId);

      setStatus("Generating ATS insights, suggestions, and job matches...");
      await apiRequest("/analyze", {
        method: "POST",
        token,
        body: {
          resumeId,
          jobDescription
        }
      });

      startTransition(() => {
        router.push(`/dashboard?resumeId=${resumeId}`);
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        title="Upload a new resume"
        description="Send a PDF or DOCX file, optionally paste a target job description, and ResumeIQ will score it, improve it, and find matching roles."
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="overflow-hidden">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-wrap gap-2">
                <span className="metric-pill">
                  <ShieldCheck className="h-3.5 w-3.5 text-tide" />
                  Private parsing flow
                </span>
                <span className="metric-pill">
                  <Sparkles className="h-3.5 w-3.5 text-coral" />
                  ATS + jobs in one run
                </span>
              </div>

              <div>
                <div className="eyebrow-chip">
                  <FileUp className="h-4 w-4" />
                  Resume upload
                </div>
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[2.1rem] border border-dashed border-slate-300 bg-[linear-gradient(180deg,rgba(248,242,233,0.94),rgba(255,255,255,0.92))] px-4 py-10 text-center transition hover:border-tide hover:bg-white sm:px-6 sm:py-12">
                  <FileUp className="h-12 w-12 text-tide" />
                  <p className="mt-4 text-lg font-semibold text-ink sm:text-xl [overflow-wrap:anywhere]">
                    {file ? file.name : "Drag a resume here or click to browse"}
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Supported formats: PDF and DOCX up to 5 MB. ResumeIQ will parse structure, score content, and store the analysis history.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 ring-1 ring-slate-200">
                      PDF
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 ring-1 ring-slate-200">
                      DOCX
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 ring-1 ring-slate-200">
                      5 MB max
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-tide">
                  <Target className="h-4 w-4" />
                  Job description
                </div>
                <textarea
                  rows={9}
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste a target role description here to reveal missing keywords and tailor suggestions."
                  className="field-textarea mt-4"
                />
                <p className="field-helper">
                  Optional, but recommended. Adding a real role description improves keyword matching, bullet rewrites, and job-fit scoring.
                </p>
              </div>

              {error ? <p className="inline-alert border-rose-100 bg-rose-50 text-rose-600">{error}</p> : null}
              {warning ? <p className="inline-alert border-amber-100 bg-amber-50 text-amber-700">{warning}</p> : null}
              {status ? <p className="inline-alert border-cyan-100 bg-mist text-tide">{status}</p> : null}

              <Button type="submit" className="w-full justify-center" disabled={loading || isPending}>
                {loading || isPending ? "Analyzing..." : "Upload and analyze"}
              </Button>
            </form>
          </Card>

          <Card tone="dark">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200">
              <Sparkles className="h-3.5 w-3.5" />
              What happens next
            </div>

            <div className="mt-6 grid gap-4">
              <div className="dark-tile">
                <h2 className="text-xl font-semibold">1. Resume parsing</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  We extract skills, education, experience, projects, and bullet points from your uploaded file.
                </p>
              </div>
              <div className="dark-tile">
                <h2 className="text-xl font-semibold">2. ATS + AI review</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  ResumeIQ scores your resume, highlights weak spots, and rewrites bullets into stronger, recruiter-ready language.
                </p>
              </div>
              <div className="dark-tile">
                <h2 className="text-xl font-semibold">3. Live job matching</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Your top skills are converted into a search query, then compared against each job to show fit and missing skills.
                </p>
              </div>
            </div>

            <div className="dark-tile mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-300">Pro move</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Paste a real job description before you submit. That gives you better keyword coverage, sharper AI suggestions, and more relevant recommendation scoring.
              </p>
            </div>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
