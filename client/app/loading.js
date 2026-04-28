export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
      <div className="rounded-[2rem] border border-white/60 bg-white/80 p-10 text-center shadow-panel backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-tide">ResumeIQ</p>
        <h2 className="mt-4 text-3xl font-semibold text-ink">Loading your workspace</h2>
        <p className="mt-3 text-slate-600">Preparing charts, suggestions, and job matches.</p>
      </div>
    </div>
  );
}

