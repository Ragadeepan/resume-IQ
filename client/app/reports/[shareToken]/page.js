"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Share2, Sparkles, Target, TrendingUp } from "lucide-react";
import { ScoreBreakdownChart } from "@/components/dashboard/ScoreBreakdownChart";
import { JobMatchCard } from "@/components/jobs/JobMatchCard";
import { Card } from "@/components/ui/Card";
import { apiRequest } from "@/lib/api";

export default function SharedReportPage() {
  const params = useParams();
  const shareToken = params?.shareToken;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shareToken) {
      return;
    }

    let active = true;

    const loadReport = async () => {
      setLoading(true);

      try {
        const response = await apiRequest(`/dashboard/report/${shareToken}`);
        if (active) {
          setReport(response);
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

    loadReport();

    return () => {
      active = false;
    };
  }, [shareToken]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {loading ? (
        <Card className="text-center">
          <h1 className="text-3xl font-semibold text-ink">Loading shared report</h1>
          <p className="mt-3 text-slate-600">Fetching the public ResumeIQ analysis.</p>
        </Card>
      ) : error ? (
        <Card className="text-center">
          <h1 className="text-3xl font-semibold text-ink">Report unavailable</h1>
          <p className="mt-3 text-slate-600">{error}</p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full border border-slate-950/5 bg-[linear-gradient(135deg,#081726,#0d7280)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(8,23,38,0.22)]"
          >
            Back to ResumeIQ
          </Link>
        </Card>
      ) : (
        <>
          <section className="relative overflow-hidden rounded-[2.1rem] border border-white/70 bg-[linear-gradient(138deg,rgba(255,255,255,0.95),rgba(244,249,252,0.86)_56%,rgba(255,245,238,0.84))] p-5 shadow-[0_30px_78px_rgba(9,21,35,0.12)] backdrop-blur-2xl sm:rounded-[2.7rem] sm:p-8">
            <div className="pointer-events-none absolute -left-10 top-12 h-36 w-36 rounded-full bg-tide/16 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-coral/14 blur-3xl" />
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="eyebrow-chip">
                  <Share2 className="h-4 w-4" />
                  Shared ResumeIQ report
                </div>
                <h1 className="mt-5 text-3xl font-semibold text-ink sm:text-4xl [overflow-wrap:anywhere]">
                  {report.candidate}&apos;s resume analysis
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Public snapshot of ATS scoring, AI improvement suggestions, and best-fit job matches.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-950/5 bg-[linear-gradient(135deg,#081726,#0d7280)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_42px_rgba(8,23,38,0.22)] sm:w-auto"
              >
                Open ResumeIQ
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="stat-shell">
                <p className="section-kicker">ATS score</p>
                <p className="mt-3 text-4xl font-semibold text-ink">{report.analysis.score}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Overall screening readiness for this shared snapshot.</p>
              </div>
              <div className="stat-shell">
                <p className="section-kicker">Skills captured</p>
                <p className="mt-3 text-4xl font-semibold text-ink">{report.resume.parsedData.skills?.length || 0}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Core capabilities extracted from the uploaded resume.</p>
              </div>
              <div className="stat-shell">
                <p className="section-kicker">Job matches</p>
                <p className="mt-3 text-4xl font-semibold text-ink">{report.jobMatches?.length || 0}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Public recommendation previews attached to this report.</p>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-tide">ATS score</p>
                  <h2 className="mt-3 text-4xl font-semibold text-ink sm:text-5xl">{report.analysis.score}</h2>
                </div>
                <div className="w-full rounded-[1.5rem] bg-shell px-5 py-4 text-left sm:w-auto sm:text-right">
                  <p className="text-sm text-slate-500">Role hint</p>
                  <p className="mt-2 text-lg font-semibold text-ink [overflow-wrap:anywhere]">{report.resume.parsedData.roleHint}</p>
                </div>
              </div>
              <div className="mt-6">
                <ScoreBreakdownChart breakdown={report.analysis.scoreBreakdown} />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-tide" />
                  <h2 className="text-2xl font-semibold text-ink">Core strengths</h2>
                </div>
                <span className="surface-badge">{report.analysis.strengths?.length || 0} highlights</span>
              </div>
              <ul className="mt-5 space-y-3">
                {report.analysis.strengths?.map((item) => (
                  <li key={item} className="insight-item text-slate-600">
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-coral" />
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Skills</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.resume.parsedData.skills?.map((skill) => (
                    <span key={skill} className="rounded-full bg-mist px-3 py-1 text-sm font-medium text-tide">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sun" />
                  <h2 className="text-2xl font-semibold text-ink">Improvement suggestions</h2>
                </div>
                <span className="surface-badge">{report.analysis.suggestions?.length || 0} ideas</span>
              </div>
              <ul className="mt-5 space-y-3">
                {report.analysis.suggestions?.map((item) => (
                  <li key={item} className="insight-item text-slate-600">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-ink">Weaknesses to address</h2>
                <span className="surface-badge">{report.analysis.weaknesses?.length || 0} risks</span>
              </div>
              <ul className="mt-5 space-y-3">
                {report.analysis.weaknesses?.map((item) => (
                  <li key={item} className="insight-item text-slate-600">
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section className="mt-6">
            <h2 className="text-2xl font-semibold text-ink sm:text-3xl">Matching jobs</h2>
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              {report.jobMatches?.length ? (
                report.jobMatches.slice(0, 4).map((job) => <JobMatchCard key={job.id} job={job} />)
              ) : (
                <Card className="text-center xl:col-span-2">
                  <h3 className="text-2xl font-semibold text-ink">No public job matches available</h3>
                  <p className="mt-3 text-slate-600">Live job recommendations will show up here when the backend job feed is configured.</p>
                </Card>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
