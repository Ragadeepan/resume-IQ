"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, Radar, RotateCcw, Sparkles, Target } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { HistoryPanel } from "@/components/dashboard/HistoryPanel";
import { JobMatchCard } from "@/components/jobs/JobMatchCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { apiRequest } from "@/lib/api";
import { getLastResumeId, setLastResumeId } from "@/lib/storage";

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedResumeId = searchParams.get("resumeId");
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [jobsData, setJobsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();
  const jobs = jobsData?.jobs || [];
  const topScore = jobs.length ? Math.max(...jobs.map((job) => job.matchScore)) : 0;
  const highFitCount = jobs.filter((job) => job.matchScore >= 80).length;
  const uniqueGapCount = Array.from(new Set(jobs.flatMap((job) => job.missingSkills || []))).length;
  const leadJob = jobs[0] || null;

  const loadJobsPage = useCallback(
    async (refresh = false) => {
      if (!token) {
        return;
      }

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      try {
        const dashboardResponse = await apiRequest("/dashboard", {
          token,
          query:
            requestedResumeId || getLastResumeId()
              ? { resumeId: requestedResumeId || getLastResumeId() }
              : undefined
        });

        const activeResumeId = dashboardResponse.selected?.resume?.id;

        setDashboard(dashboardResponse);
        if (activeResumeId) {
          setLastResumeId(activeResumeId);
          const jobsResponse = await apiRequest("/jobs", {
            token,
            query: {
              resumeId: activeResumeId,
              refresh: refresh ? "true" : undefined
            }
          });

          setJobsData(jobsResponse);
        } else {
          setJobsData(null);
        }
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [requestedResumeId, token]
  );

  useEffect(() => {
    loadJobsPage();
  }, [loadJobsPage]);

  const handleSelectResume = (resumeId) => {
    startTransition(() => {
      router.push(`/jobs?resumeId=${resumeId}`);
    });
  };

  return (
    <ProtectedRoute>
      <AppShell
        title="Smart job recommendations"
        description="See how your resume stacks up against live openings, which skills are still missing, and where to apply next."
        actions={
          jobsData?.resumeId ? (
            <Button variant="secondary" onClick={() => loadJobsPage(true)} disabled={refreshing}>
              <RotateCcw className="h-4 w-4" />
              {refreshing ? "Refreshing..." : "Refresh jobs"}
            </Button>
          ) : null
        }
      >
        {loading ? (
          <Card className="text-center">
            <h2 className="text-3xl font-semibold text-ink">Loading recommendations</h2>
            <p className="mt-3 text-slate-600">We&apos;re syncing your latest resume and job matches.</p>
          </Card>
        ) : error ? (
          <Card className="text-center">
            <h2 className="text-3xl font-semibold text-ink">Recommendations unavailable</h2>
            <p className="mt-3 text-slate-600">{error}</p>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.92fr_2.08fr]">
            <HistoryPanel
              history={dashboard?.history}
              activeResumeId={dashboard?.selected?.resume?.id}
              onSelect={handleSelectResume}
            />

            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="section-kicker">Recommendation stream</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">Live openings shaped by your resume</h2>
                </div>
                <p className="max-w-xl text-sm leading-6 text-slate-500">
                  Refresh the feed after updating your resume or target role to see better-fit openings and missing-skill patterns.
                </p>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
                <Card tone="dark" className="overflow-hidden">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="eyebrow-chip bg-white/10 text-white ring-1 ring-white/12 shadow-none">
                        <Radar className="h-3.5 w-3.5" />
                        Active search query
                      </div>
                      <h2 className="mt-4 max-w-3xl text-2xl font-semibold text-white sm:text-3xl [overflow-wrap:anywhere]">
                        {jobsData?.query || "No active query"}
                      </h2>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                        ResumeIQ converts your strongest role and skill signals into a live search phrase, then scores openings against missing and aligned requirements.
                      </p>
                    </div>

                    <div className="stat-shell-dark xl:min-w-[180px]">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Top opening</p>
                      <p className="mt-2 text-3xl font-semibold text-white">{topScore ? `${topScore}%` : "--"}</p>
                      <p className="mt-2 text-sm text-slate-300 [overflow-wrap:anywhere]">
                        {leadJob ? `${leadJob.jobTitle} at ${leadJob.company}` : "No scored roles yet"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <div className="dark-tile p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Matches returned</p>
                      <p className="mt-2 text-3xl font-semibold">{jobs.length}</p>
                      <p className="mt-2 text-sm text-slate-300">Current feed size for this resume snapshot.</p>
                    </div>
                    <div className="dark-tile p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">High-fit roles</p>
                      <p className="mt-2 text-3xl font-semibold">{highFitCount}</p>
                      <p className="mt-2 text-sm text-slate-300">Openings scoring 80% or above.</p>
                    </div>
                    <div className="dark-tile p-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-300">Unique skill gaps</p>
                      <p className="mt-2 text-3xl font-semibold">{uniqueGapCount}</p>
                      <p className="mt-2 text-sm text-slate-300">Distinct requirements you may want to cover next.</p>
                    </div>
                  </div>
                </Card>

                <div className="grid gap-4">
                  <Card tone="muted">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">Feed source</p>
                        <h3 className="mt-2 text-xl font-semibold text-ink">{jobsData?.source || "Unknown source"}</h3>
                      </div>
                      <BriefcaseBusiness className="h-5 w-5 text-tide" />
                    </div>
                    {jobsData?.error ? (
                      <p className="mt-4 rounded-[1.4rem] bg-amber-50 px-4 py-3 text-sm text-amber-700">{jobsData.error}</p>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Refresh after improving your resume or updating the target role to get a cleaner recommendation set.
                      </p>
                    )}
                    {jobsData?.source === "development-fallback" ? (
                      <p className="mt-4 rounded-[1.4rem] bg-mist px-4 py-3 text-sm text-tide">
                        Local mode is using fallback recommendations generated from extracted skills because RapidAPI JSearch is unavailable or not configured.
                      </p>
                    ) : null}
                  </Card>

                  <Card>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="section-kicker">Application angle</p>
                        <h3 className="mt-2 text-xl font-semibold text-ink">What to tailor first</h3>
                      </div>
                      <Target className="h-5 w-5 text-coral" />
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="insight-item text-slate-600">
                        <Sparkles className="mt-1 h-4 w-4 shrink-0 text-tide" />
                        <span>{leadJob ? `Lead with ${leadJob.jobTitle} language in your summary and recent bullets.` : "Refresh jobs to surface role-specific language cues."}</span>
                      </div>
                      <div className="insight-item text-slate-600">
                        <Sparkles className="mt-1 h-4 w-4 shrink-0 text-coral" />
                        <span>{uniqueGapCount ? `Cover ${uniqueGapCount} recurring missing skills across the feed to raise match quality.` : "Current openings do not show major repeated gaps yet."}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {jobs.length ? (
                <div className="grid gap-6 xl:grid-cols-2">
                  {jobs.map((job) => (
                    <JobMatchCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <Card className="text-center">
                  <h2 className="text-2xl font-semibold text-ink">No live jobs yet</h2>
                  <p className="mt-3 text-slate-600">
                    Configure and subscribe the RapidAPI JSearch app in the backend to populate this page with live opportunities.
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
