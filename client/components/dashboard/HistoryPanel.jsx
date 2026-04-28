"use client";

import { Clock3 } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { Card } from "@/components/ui/Card";

export function HistoryPanel({ history, activeResumeId, onSelect }) {
  return (
    <Card className="h-full lg:sticky lg:top-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist text-tide shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <Clock3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-ink">Analysis history</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              {history?.length || 0} saved snapshots
            </p>
          </div>
        </div>
        <span className="surface-badge self-start">Timeline view</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Switch between uploaded resumes and revisit older ATS snapshots without losing your current context.
      </p>
      <div className="mt-5 space-y-3">
        {history?.length ? (
          history.map((item) => (
            <button
              key={item.resumeId}
              onClick={() => onSelect(item.resumeId)}
              className={`group w-full rounded-[1.7rem] border p-4 text-left transition hover:-translate-y-0.5 ${
                activeResumeId === item.resumeId
                  ? "border-tide/35 bg-[linear-gradient(145deg,rgba(232,247,251,0.92),rgba(255,255,255,0.9))] shadow-[0_18px_34px_rgba(15,155,176,0.08)]"
                  : "border-white/80 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] hover:border-slate-300 hover:bg-white"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${activeResumeId === item.resumeId ? "bg-tide" : "bg-slate-300"}`} />
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {activeResumeId === item.resumeId ? "Current report" : "Saved report"}
                    </span>
                  </div>
                  <p className="font-semibold text-ink [overflow-wrap:anywhere]">{item.originalFileName}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatDate(item.uploadedAt)}</p>
                </div>
                <div className="self-start rounded-full border border-white/70 bg-white/82 px-3 py-1 text-sm font-semibold text-ink shadow-[0_10px_20px_rgba(9,21,35,0.06)]">
                  {item.score !== null ? `${item.score}/100` : "Pending"}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.topSkills?.map((skill) => (
                  <span
                    key={`${item.resumeId}-${skill}`}
                    className="rounded-full bg-slate-100/90 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </button>
          ))
        ) : (
          <p className="rounded-[1.7rem] border border-dashed border-slate-200 p-5 text-sm leading-6 text-slate-500">
            Your uploaded resume analyses will appear here.
          </p>
        )}
      </div>
    </Card>
  );
}
