"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  FolderKanban,
  Radar,
  Share2,
  Sparkles,
  Target,
  TrendingUp
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ScoreBreakdownChart } from "@/components/dashboard/ScoreBreakdownChart";
import { HistoryPanel } from "@/components/dashboard/HistoryPanel";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiRequest } from "@/lib/api";
import { formatDate, formatScoreLabel, scoreTone } from "@/lib/formatters";
import { getLastResumeId, setLastResumeId } from "@/lib/storage";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedResumeId = searchParams.get("resumeId");
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const resumeId = requestedResumeId || getLastResumeId();
        const response = await apiRequest("/dashboard", {
          token,
          query: resumeId ? { resumeId } : undefined
        });

        if (!active) {
          return;
        }

        setDashboard(response);
        if (response.selected?.resume?.id) {
          setLastResumeId(response.selected.resume.id);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [requestedResumeId, token]);

  const selected = dashboard?.selected;
  const analysis = selected?.analysis;
  const resume = selected?.resume;
  const keywordCoverage = analysis?.keywordReport?.provided ? analysis.keywordReport.keywordCoverage : null;
  const topSkills = resume?.parsedData?.skills?.slice(0, 6) || [];
  const recurringSkills = dashboard?.summary?.topSkills?.slice(0, 5) || [];
  const topJobMatch = selected?.jobMatches?.[0] || null;
  const roleHint = resume?.parsedData?.roleHint || "Role focus still being inferred";

  const statCards = useMemo(
    () => [
      {
        label: "Average ATS score",
        value: dashboard?.summary?.averageScore || 0,
        suffix: "/100"
      },
      {
        label: "Resumes uploaded",
        value: dashboard?.summary?.totalResumes || 0
      },
      {
        label: "Analyses saved",
        value: dashboard?.summary?.analyzedResumes || 0
      }
    ],
    [dashboard]
  );

  const handleSelectResume = (resumeId) => {
    startTransition(() => {
      router.push(`/dashboard?resumeId=${resumeId}`);
    });
  };

  const copyShareLink = async () => {
    if (!analysis?.shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(analysis.shareUrl);
    setCopyState("Copied");
    window.setTimeout(() => setCopyState(""), 1800);
  };

  return (
    <ProtectedRoute>
      <AppShell
        title="Resume command center"
        description="Track ATS performance, inspect resume structure, review AI guidance, and keep every analysis organized in one place."
        actions={
          analysis?.shareUrl ? (
            <Button variant="secondary" onClick={copyShareLink}>
              <Copy className="h-4 w-4" />
              {copyState || "Copy share link"}
            </Button>
          ) : null
        }
      >
        {loading ? (
          <Card className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-tide">Loading</p>
            <h2 className="mt-4 text-3xl font-semibold text-ink">Building your dashboard</h2>
            <p className="mt-3 text-slate-600">We&apos;re pulling the latest ATS report, suggestions, and history.</p>
          </Card>
        ) : error ? (
          <Card className="text-center">
            <h2 className="text-2xl font-semibold text-ink">Dashboard unavailable</h2>
            <p className="mt-3 text-slate-600">{error}</p>
          </Card>
        ) : !selected ? (
          <Card className="text-center">
            <h2 className="text-3xl font-semibold text-ink">No analysis yet</h2>
            <p className="mt-3 text-slate-600">Upload your first resume to unlock ATS scoring and smart job recommendations.</p>
            <Link
              href="/upload"
              className="mt-6 inline-flex rounded-full border border-slate-950/5 bg-[linear-gradient(135deg,#081726,#0d7280)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(8,23,38,0.22)]"
            >
              Upload a resume
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.92fr_2.08fr]">
            <HistoryPanel history={dashboard.history} activeResumeId={resume.id} onSelect={handleSelectResume} />

            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Workspace overview</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Your latest performance snapshot</h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  Track score movement, review profile signals, and move directly into refinement when a role needs extra tailoring.
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <Card tone="dark" className="overflow-hidden">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="eyebrow-chip bg-white/10 text-white ring-1 ring-white/12 shadow-none">
                        <Radar className="h-4 w-4" />
                        Selected resume pulse
                      </div>
                      <h3 className="mt-5 text-2xl font-semibold text-white sm:text-3xl [overflow-wrap:anywhere]">
                        {resume.originalFileName}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                        {roleHint} profile with {resume.parsedData.experience?.length || 0} experience entries,{" "}
                        {resume.parsedData.projects?.length || 0} project highlights, and{" "}
                        {resume.parsedData.metricsCount || 0} quantified wins detected.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {topSkills.length ? (
                          topSkills.map((skill) => (
                            <span key={skill} className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                            Add more role-specific skills to strengthen visibility
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:w-[280px] xl:grid-cols-1">
                      <div className="stat-shell-dark">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">ATS score</p>
                        <p className={`mt-2 text-4xl font-semibold ${scoreTone(analysis?.score || 0)}`}>{analysis?.score || 0}</p>
                        <p className="mt-2 text-sm text-slate-300">{analysis ? formatScoreLabel(analysis.score) : "Awaiting analysis"}</p>
                      </div>
                      <div className="stat-shell-dark">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Keyword coverage</p>
                        <p className="mt-2 text-4xl font-semibold text-white">
                          {keywordCoverage !== null ? `${keywordCoverage}%` : "--"}
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          {keywordCoverage !== null ? "Live role alignment detected" : "Paste a target role to unlock"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <div className="dark-tile p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Last upload</p>
                      <p className="mt-2 text-lg font-semibold">{formatDate(resume.uploadedAt)}</p>
                      <p className="mt-2 text-sm text-slate-300">Newest parsed version active in the workspace.</p>
                    </div>
                    <div className="dark-tile p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Best match</p>
                      <p className="mt-2 text-lg font-semibold [overflow-wrap:anywhere]">
                        {topJobMatch ? `${topJobMatch.matchScore}% ${topJobMatch.jobTitle}` : "No jobs cached yet"}
                      </p>
                      <p className="mt-2 text-sm text-slate-300">
                        {topJobMatch ? `${topJobMatch.company} in ${topJobMatch.location}` : "Refresh recommendations after analysis."}
                      </p>
                    </div>
                    <div className="dark-tile p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Share state</p>
                      <p className="mt-2 text-lg font-semibold">{analysis?.shareUrl ? "Public link ready" : "Private only"}</p>
                      <p className="mt-2 text-sm text-slate-300">
                        {analysis?.shareUrl ? "Copy the report link to share this analysis externally." : "Share links appear after analysis is created."}
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="grid gap-4">
                  <Card tone="muted">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">Recurring strengths</p>
                        <h3 className="mt-2 text-xl font-semibold text-ink">Top skills across uploads</h3>
                      </div>
                      <TrendingUp className="h-5 w-5 text-tide" />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {recurringSkills.length ? (
                        recurringSkills.map((entry) => (
                          <span key={entry.skill} className="surface-badge">
                            {entry.skill}
                            <span className="rounded-full bg-white px-2 py-0.5 text-[0.65rem] text-slate-500">
                              {entry.count}
                            </span>
                          </span>
                        ))
                      ) : (
                        <p className="text-sm leading-6 text-slate-500">
                          Upload a few resume versions and ResumeIQ will surface the most repeated strengths here.
                        </p>
                      )}
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">Shareable review</p>
                        <h3 className="mt-2 text-xl font-semibold text-ink">Send a clean public snapshot</h3>
                      </div>
                      <Share2 className="h-5 w-5 text-coral" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Use the public report when you want to share ATS scoring and recommendations without exposing the full private workspace.
                    </p>
                    {analysis?.shareUrl ? (
                      <a
                        href={analysis.shareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-tide"
                      >
                        Open public report
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <p className="mt-5 rounded-[1.4rem] bg-shell px-4 py-3 text-sm leading-6 text-slate-600">
                        This resume needs a completed analysis before a shareable report can be opened.
                      </p>
                    )}
                  </Card>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {statCards.map((card, index) => (
                  <Card
                    key={card.label}
                    tone={index === 0 ? "muted" : "default"}
                  >
                    <p className="section-kicker">{card.label}</p>
                    <p className="mt-3 text-4xl font-semibold text-ink">
                      {card.value}
                      {card.suffix || ""}
                    </p>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Report analysis</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Deep read on your selected resume</h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  This section combines score breakdown, role fit context, and the parsed profile extracted from the uploaded file.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <Card>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="eyebrow-chip">
                        <FileText className="h-4 w-4" />
                        Selected report
                      </div>
                      <h2 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl [overflow-wrap:anywhere]">{resume.originalFileName}</h2>
                      <p className="mt-2 text-sm text-slate-500">Uploaded {formatDate(resume.uploadedAt)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="surface-badge">Role hint: {roleHint}</span>
                        <span className="surface-badge">{resume.fileType?.toUpperCase() || "Resume file"}</span>
                      </div>
                      {resume.fileUrl ? (
                        <a
                          href={resume.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-tide"
                        >
                          <FileText className="h-4 w-4" />
                          View uploaded resume
                        </a>
                      ) : null}
                    </div>
                    {analysis ? (
                      <div className="w-full rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(104,214,255,0.14),transparent_28%),linear-gradient(155deg,#081726,#10263b_52%,#0d7280)] px-5 py-4 text-left text-white shadow-[0_22px_48px_rgba(8,23,38,0.24)] sm:w-auto sm:text-right">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-300">ATS score</p>
                        <p className={`mt-2 text-4xl font-semibold ${scoreTone(analysis.score)}`}>{analysis.score}</p>
                        <p className="mt-1 text-sm text-slate-300">{formatScoreLabel(analysis.score)}</p>
                      </div>
                    ) : null}
                  </div>

                  {analysis ? (
                    <div className="mt-6 rounded-[1.8rem] border border-white/70 bg-white/66 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]">
                      <ScoreBreakdownChart breakdown={analysis.scoreBreakdown} />
                    </div>
                  ) : (
                    <p className="mt-6 rounded-[1.7rem] bg-shell p-5 text-slate-600">
                      This resume has been uploaded, but no analysis report is available yet.
                    </p>
                  )}
                </Card>

                <Card>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-coral" />
                    <h2 className="text-xl font-semibold text-ink">Resume profile</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {resume.parsedData.summary || "Add a concise professional summary to give recruiters faster context."}
                  </p>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Top skills</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {resume.parsedData.skills?.length ? resume.parsedData.skills.map((skill) => (
                        <span key={skill} className="rounded-full border border-white/80 bg-mist px-3 py-1 text-sm font-medium text-tide">
                          {skill}
                        </span>
                      )) : (
                        <p className="text-sm leading-6 text-slate-500">Skills will appear here after ResumeIQ extracts them from the uploaded file.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <div className="soft-tile p-4">
                      <p className="text-sm text-slate-500">Experience entries</p>
                      <p className="mt-2 text-3xl font-semibold text-ink">{resume.parsedData.experience?.length || 0}</p>
                    </div>
                    <div className="soft-tile p-4">
                      <p className="text-sm text-slate-500">Projects</p>
                      <p className="mt-2 text-3xl font-semibold text-ink">{resume.parsedData.projects?.length || 0}</p>
                    </div>
                    <div className="soft-tile p-4">
                      <p className="text-sm text-slate-500">Metrics found</p>
                      <p className="mt-2 text-3xl font-semibold text-ink">{resume.parsedData.metricsCount || 0}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Improvement focus</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">What to keep, fix, and do next</h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  ResumeIQ separates strengths from weak spots so you can improve faster without losing what is already working.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-3">
                <Card>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-tide" />
                      <h2 className="text-xl font-semibold text-ink">Strengths</h2>
                    </div>
                    <span className="surface-badge">{analysis?.strengths?.length || 0} signals</span>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {(analysis?.strengths || []).length ? (
                      (analysis?.strengths || []).map((item) => (
                        <li key={item} className="insight-item text-slate-600">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="rounded-[1.4rem] bg-shell px-4 py-3 text-sm leading-6 text-slate-600">
                        Strength highlights will appear after the selected resume is analyzed.
                      </li>
                    )}
                  </ul>
                </Card>

                <Card tone="muted">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-5 w-5 text-coral" />
                      <h2 className="text-xl font-semibold text-ink">Weaknesses</h2>
                    </div>
                    <span className="surface-badge">{analysis?.weaknesses?.length || 0} gaps</span>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {(analysis?.weaknesses || []).length ? (
                      (analysis?.weaknesses || []).map((item) => (
                        <li key={item} className="insight-item text-slate-600">
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <li className="rounded-[1.4rem] bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
                        No weaknesses were generated yet for this resume snapshot.
                      </li>
                    )}
                  </ul>
                </Card>

                <Card tone="dark">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-sun" />
                      <h2 className="text-xl font-semibold text-white">Next actions</h2>
                    </div>
                    <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200">
                      {analysis?.suggestions?.length || 0} moves
                    </span>
                  </div>
                  <ul className="mt-4 space-y-3">
                    {(analysis?.suggestions || []).length ? (
                      (analysis?.suggestions || []).map((item) => (
                        <li key={item} className="dark-tile px-4 py-3 text-sm leading-6 text-slate-200">
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="dark-tile px-4 py-3 text-sm leading-6 text-slate-200">
                        Suggestions will appear here after ResumeIQ finishes reviewing the selected upload.
                      </li>
                    )}
                  </ul>
                </Card>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Target role alignment</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Keywords and market fit</h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  Use the keyword report and job previews together to decide whether to refine wording, skills framing, or both.
                </p>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <Card>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-ink">Keyword optimization</h2>
                      <p className="mt-2 text-sm text-slate-500">
                        Compare job description language against your uploaded resume.
                      </p>
                    </div>
                    <Link href={`/suggestions?resumeId=${resume.id}`} className="text-sm font-semibold text-tide">
                      Open suggestions
                    </Link>
                  </div>

                  {analysis?.keywordReport?.provided ? (
                    <>
                      <div className="mt-5 rounded-[1.7rem] bg-shell p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Keyword coverage</p>
                            <p className="mt-2 text-4xl font-semibold text-ink">{analysis.keywordReport.keywordCoverage}%</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="surface-badge surface-badge-positive">
                              {analysis.keywordReport.matchedKeywords?.length || 0} matched
                            </span>
                            <span className="surface-badge surface-badge-danger">
                              {analysis.keywordReport.missingKeywords?.length || 0} missing
                            </span>
                          </div>
                        </div>
                        <div className="progress-track mt-4">
                          <div
                            className="progress-fill"
                            style={{ width: `${Math.max(0, Math.min(100, analysis.keywordReport.keywordCoverage || 0))}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Matched</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {analysis.keywordReport.matchedKeywords?.map((keyword) => (
                              <span
                                key={keyword}
                                className="rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Missing</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {analysis.keywordReport.missingKeywords?.map((keyword) => (
                              <span
                                key={keyword}
                                className="rounded-full border border-rose-200/70 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="mt-5 rounded-[1.7rem] bg-shell p-5 text-sm leading-6 text-slate-600">
                      Paste a job description during upload to surface missing keywords and tailor your resume more precisely.
                    </p>
                  )}
                </Card>

                <Card>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-ink">Top job matches</h2>
                      <p className="mt-2 text-sm text-slate-500">Preview the strongest roles from your latest recommendation set.</p>
                    </div>
                    <Link href={`/jobs?resumeId=${resume.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-tide">
                      View all
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="mt-5 space-y-3">
                    {selected.jobMatches?.slice(0, 3).map((job) => (
                      <div key={job.id} className="rounded-[1.7rem] bg-shell p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-ink [overflow-wrap:anywhere]">{job.jobTitle}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {job.company} · {job.location}
                            </p>
                          </div>
                          <span className="self-start rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink ring-1 ring-slate-200">
                            {job.matchScore}%
                          </span>
                        </div>
                        {job.missingSkills?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {job.missingSkills.slice(0, 3).map((skill) => (
                              <span
                                key={`${job.id}-${skill}`}
                                className="rounded-full border border-rose-200/80 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600"
                              >
                                Missing: {skill}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                    {!selected.jobMatches?.length ? (
                      <p className="rounded-[1.7rem] bg-shell p-5 text-sm leading-6 text-slate-600">
                        Live job recommendations will appear here when RapidAPI JSearch is configured.
                      </p>
                    ) : null}
                    {selected.analysis && !selected.jobMatches?.length && selected.analysis.targetJobDescription ? (
                      <p className="rounded-[1.7rem] bg-mist p-5 text-sm leading-6 text-tide">
                        Re-run the analysis from the Suggestions page after adding API keys to refresh this role-specific recommendation set.
                      </p>
                    ) : null}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
