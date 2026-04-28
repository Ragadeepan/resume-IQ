"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, Lightbulb, Radar, Sparkles, Target, WandSparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { HistoryPanel } from "@/components/dashboard/HistoryPanel";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiRequest } from "@/lib/api";
import { getLastResumeId, setLastResumeId } from "@/lib/storage";

export default function SuggestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedResumeId = searchParams.get("resumeId");
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [, startTransition] = useTransition();

  const loadSuggestions = useCallback(async (showLoader = true) => {
    if (!token) {
      return;
    }

    if (showLoader) {
      setLoading(true);
    }
    setError("");

    try {
      const response = await apiRequest("/dashboard", {
        token,
        query:
          requestedResumeId || getLastResumeId()
            ? { resumeId: requestedResumeId || getLastResumeId() }
            : undefined
      });

      setDashboard(response);
      if (response.selected?.resume?.id) {
        setLastResumeId(response.selected.resume.id);
      }
      setJobDescription(response.selected?.analysis?.targetJobDescription || "");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [requestedResumeId, token]);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const selected = dashboard?.selected;
  const analysis = selected?.analysis;
  const keywordCoverage = analysis?.keywordReport?.provided ? analysis.keywordReport.keywordCoverage : null;
  const matchedKeywords = analysis?.keywordReport?.matchedKeywords?.length || 0;
  const missingKeywords = analysis?.keywordReport?.missingKeywords?.length || 0;
  const roleHint = selected?.resume?.parsedData?.roleHint || "Role focus not detected yet";

  const handleSelectResume = (resumeId) => {
    startTransition(() => {
      router.push(`/suggestions?resumeId=${resumeId}`);
    });
  };

  const copyImprovedBullets = async () => {
    const payload = analysis?.improvedBullets
      ?.map((item) => `Original: ${item.original}\nImproved: ${item.improved}`)
      .join("\n\n");

    if (!payload) {
      return;
    }

    await navigator.clipboard.writeText(payload);
    setCopyState("Copied");
    window.setTimeout(() => setCopyState(""), 1800);
  };

  const rerunAnalysis = async () => {
    if (!selected?.resume?.id) {
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      await apiRequest("/analyze", {
        method: "POST",
        token,
        body: {
          resumeId: selected.resume.id,
          jobDescription
        }
      });

      await loadSuggestions(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell
        title="AI suggestions and bullet rewrites"
        description="Review the highest-impact changes ResumeIQ recommends, then copy polished bullet points into your resume."
        actions={
          analysis?.improvedBullets?.length ? (
            <Button variant="secondary" onClick={copyImprovedBullets}>
              <Copy className="h-4 w-4" />
              {copyState || "Copy improved bullets"}
            </Button>
          ) : null
        }
      >
        {loading ? (
          <Card className="text-center">
            <h2 className="text-3xl font-semibold text-ink">Loading suggestions</h2>
            <p className="mt-3 text-slate-600">We&apos;re gathering your latest feedback and rewritten bullets.</p>
          </Card>
        ) : error ? (
          <Card className="text-center">
            <h2 className="text-3xl font-semibold text-ink">Suggestions unavailable</h2>
            <p className="mt-3 text-slate-600">{error}</p>
          </Card>
        ) : !selected ? (
          <Card className="text-center">
            <h2 className="text-3xl font-semibold text-ink">No analysis yet</h2>
            <p className="mt-3 text-slate-600">Upload a resume to generate suggestions and bullet improvements.</p>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.92fr_2.08fr]">
            <HistoryPanel history={dashboard.history} activeResumeId={selected.resume.id} onSelect={handleSelectResume} />

            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Refinement workspace</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Tailor the resume before you apply</h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  Use this page to compare the target role against your resume and turn weak bullets into sharper, recruiter-friendly phrasing.
                </p>
              </div>

              {analysis ? (
                <div className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                  <Card tone="dark">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="eyebrow-chip bg-white/10 text-white ring-1 ring-white/12 shadow-none">
                          <WandSparkles className="h-3.5 w-3.5" />
                          Active refinement flow
                        </div>
                        <h3 className="mt-4 text-2xl font-semibold text-white sm:text-3xl [overflow-wrap:anywhere]">
                          {selected.resume.originalFileName}
                        </h3>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                          {roleHint} targeting workspace with live bullet improvements, keyword intelligence, and resume-specific rewrite guidance.
                        </p>
                      </div>

                      <div className="stat-shell-dark xl:min-w-[180px]">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Current ATS</p>
                        <p className="mt-2 text-4xl font-semibold text-white">{analysis.score}</p>
                        <p className="mt-2 text-sm text-slate-300">Refresh after each role-specific pass.</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                      <div className="dark-tile p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Improved bullets</p>
                        <p className="mt-2 text-3xl font-semibold">{analysis.improvedBullets?.length || 0}</p>
                        <p className="mt-2 text-sm text-slate-300">Before/after rewrites ready to copy.</p>
                      </div>
                      <div className="dark-tile p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Suggestions</p>
                        <p className="mt-2 text-3xl font-semibold">{analysis.suggestions?.length || 0}</p>
                        <p className="mt-2 text-sm text-slate-300">Priority moves surfaced by the review engine.</p>
                      </div>
                      <div className="dark-tile p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Keyword coverage</p>
                        <p className="mt-2 text-3xl font-semibold">{keywordCoverage !== null ? `${keywordCoverage}%` : "--"}</p>
                        <p className="mt-2 text-sm text-slate-300">Alignment against the saved target role.</p>
                      </div>
                    </div>
                  </Card>

                  <div className="grid gap-4">
                    <Card tone="muted" className="p-4">
                      <p className="section-kicker">Keyword state</p>
                      <p className="mt-3 text-3xl font-semibold text-ink">{matchedKeywords}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">Matched terms already mirrored from the target description.</p>
                    </Card>
                    <Card className="p-4">
                      <p className="section-kicker">Gaps to cover</p>
                      <p className="mt-3 text-3xl font-semibold text-ink">{missingKeywords}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">Missing terms that can lift ATS alignment when added naturally.</p>
                    </Card>
                  </div>
                </div>
              ) : null}

              <Card tone="muted">
                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <div>
                    <div className="flex items-center gap-2">
                      <WandSparkles className="h-5 w-5 text-tide" />
                      <h2 className="text-xl font-semibold text-ink">Keyword optimization</h2>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Paste a target job description and rerun the analysis to refresh missing keywords, ATS fit, suggestions, and job recommendations.
                    </p>
                    <textarea
                      rows={8}
                      value={jobDescription}
                      onChange={(event) => setJobDescription(event.target.value)}
                      placeholder="Paste the role description you want to optimize for."
                      className="field-textarea mt-5"
                    />
                    <p className="field-helper">
                      Re-running analysis refreshes keyword gaps, ATS fit, bullet rewrites, and job recommendations using this description.
                    </p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button onClick={rerunAnalysis} disabled={analyzing} className="w-full sm:w-auto">
                        {analyzing ? "Refreshing analysis..." : "Re-run analysis"}
                      </Button>
                      {analysis?.targetJobDescription ? (
                        <Button
                          variant="ghost"
                          onClick={() => setJobDescription(analysis.targetJobDescription)}
                          className="w-full sm:w-auto"
                        >
                          Reset to saved description
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="stat-shell">
                      <div className="flex items-center gap-2">
                        <Radar className="h-4 w-4 text-tide" />
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Saved targeting state</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {analysis?.targetJobDescription
                          ? "A saved role description already exists for this resume. You can refine it here and rerun the full analysis."
                          : "No saved role description yet. Add one here to unlock stronger keyword guidance and sharper job matching."}
                      </p>
                    </div>
                    <div className="stat-shell">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-coral" />
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Refinement tip</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Keep the role description realistic and current. Real hiring language produces much better bullet rewrites and missing-skill signals.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-coral" />
                      <h2 className="text-xl font-semibold text-ink">Priority suggestions</h2>
                    </div>
                    <span className="surface-badge">{analysis?.suggestions?.length || 0} notes</span>
                  </div>
                  <ul className="mt-5 space-y-4">
                    {(analysis?.suggestions || []).length ? (
                      (analysis?.suggestions || []).map((item, index) => (
                        <li key={item} className="insight-item text-slate-600">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-mist text-xs font-semibold uppercase tracking-[0.18em] text-tide">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="rounded-[1.6rem] bg-shell p-4 text-sm leading-6 text-slate-600">
                        Suggestions will appear here once analysis data is available for this resume.
                      </li>
                    )}
                  </ul>
                </Card>

                <Card>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-sun" />
                      <h2 className="text-xl font-semibold text-ink">Keyword gaps</h2>
                    </div>
                    {keywordCoverage !== null ? <span className="surface-badge">{keywordCoverage}% aligned</span> : null}
                  </div>
                  {analysis?.keywordReport?.provided ? (
                    <div className="mt-5">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.max(0, Math.min(100, analysis.keywordReport.keywordCoverage || 0))}%` }}
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {analysis.keywordReport.missingKeywords?.length ? (
                          analysis.keywordReport.missingKeywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="rounded-full border border-rose-200/80 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-600"
                            >
                              {keyword}
                            </span>
                          ))
                        ) : (
                          <p className="rounded-[1.6rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            Great coverage. Your resume already mirrors the target description closely.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 rounded-[1.6rem] bg-shell p-5 text-sm leading-6 text-slate-600">
                      Add a job description during upload to unlock keyword gap analysis.
                    </p>
                  )}
                </Card>
              </div>

              <Card>
                <h2 className="text-2xl font-semibold text-ink">Bullet improver</h2>
                <p className="mt-2 text-sm text-slate-500">
                  These rewrites keep your facts intact while improving clarity, tone, and ATS alignment.
                </p>

                <div className="mt-6 space-y-4">
                  {(analysis?.improvedBullets || []).map((item, index) => (
                    <div key={`${item.original}-${index}`} className="grid gap-4 rounded-[1.85rem] border border-white/80 bg-[linear-gradient(180deg,rgba(248,242,233,0.72),rgba(255,255,255,0.8))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] lg:grid-cols-2">
                      <div>
                        <div className="surface-badge">Rewrite {String(index + 1).padStart(2, "0")}</div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Original</p>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{item.original}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Improved</p>
                        <p className="mt-3 text-sm leading-6 text-ink">{item.improved}</p>
                      </div>
                    </div>
                  ))}
                  {!analysis?.improvedBullets?.length ? (
                    <p className="rounded-[1.7rem] bg-shell p-5 text-sm leading-6 text-slate-600">
                      Upload a resume with experience or project bullets to generate improvements here.
                    </p>
                  ) : null}
                </div>
              </Card>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
