"use client";

import { AlertCircle, ArrowUpRight, BriefcaseBusiness, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function JobMatchCard({ job }) {
  const missingSkills = job.missingSkills || [];
  const requiredSkills = job.requiredSkills || [];
  const missingSkillSet = new Set(missingSkills.map((skill) => skill.toLowerCase()));
  const alignedSkills = requiredSkills.filter((skill) => !missingSkillSet.has(skill.toLowerCase()));

  let fitLabel = "Early fit";
  if (job.matchScore >= 85) {
    fitLabel = "High fit";
  } else if (job.matchScore >= 70) {
    fitLabel = "Strong fit";
  } else if (job.matchScore >= 55) {
    fitLabel = "Worth tailoring";
  }

  return (
    <Card className="h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-tide shadow-[inset_0_1px_0_rgba(255,255,255,0.78)]">
            <Sparkles className="h-3.5 w-3.5" />
            {fitLabel}
          </div>
          <h3 className="mt-4 text-xl font-semibold text-ink [overflow-wrap:anywhere]">{job.jobTitle}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <BriefcaseBusiness className="h-4 w-4" />
              {job.company}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {job.location}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
          <div className="stat-shell self-stretch px-4 py-3 text-left sm:min-w-[120px] sm:self-auto sm:text-right">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Match score</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{job.matchScore}%</p>
          </div>
          <a href={job.applyLink} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
            <Button variant="accent" className="w-full sm:w-auto">
              Apply
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      <div className="soft-tile mt-5 p-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Role preview</p>
        <p className="text-sm leading-6 text-slate-600">{job.metadata?.descriptionSnippet}</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="soft-tile p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Aligned skills</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {alignedSkills.length ? (
              alignedSkills.map((skill) => (
                <span
                  key={`${job.id}-aligned-${skill}`}
                  className="rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-slate-200/80 bg-slate-100/90 px-3 py-1 text-xs font-medium text-slate-600">
                No clearly aligned requirements yet
              </span>
            )}
          </div>
        </div>

        <div className="soft-tile p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Skill gaps</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {missingSkills.length ? (
              missingSkills.map((skill) => (
                <span
                  key={`${job.id}-missing-${skill}`}
                  className="rounded-full border border-rose-200/80 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                No major skill gaps detected
              </span>
            )}
          </div>
        </div>
      </div>

      {!requiredSkills.length ? (
        <p className="mt-4 rounded-[1.45rem] bg-shell px-4 py-3 text-sm leading-6 text-slate-600">
          Role requirements were not published clearly, so ResumeIQ is estimating fit from title, summary, and available metadata.
        </p>
      ) : null}
    </Card>
  );
}
