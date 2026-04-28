import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  WandSparkles
} from "lucide-react";

const features = [
  {
    title: "Upload and parse with structure",
    description: "Process PDF and DOCX resumes, extract key sections, and keep each analysis organized in one timeline.",
    icon: UploadCloud
  },
  {
    title: "Read ATS performance at a glance",
    description: "Track weighted scoring across skills, experience, projects, and education with a recruiter-friendly breakdown.",
    icon: BarChart3
  },
  {
    title: "Tailor faster for target roles",
    description: "Compare your resume against job-description language and surface the highest-impact gaps to close.",
    icon: Target
  },
  {
    title: "Smarter job targeting",
    description: "Turn your strongest skills into live job searches and compare each opening against your resume with visible fit.",
    icon: BriefcaseBusiness
  },
  {
    title: "Rewrites without losing your facts",
    description: "Generate clearer, stronger bullet-point phrasing that keeps your original work intact.",
    icon: WandSparkles
  }
];

const workflow = [
  {
    step: "01",
    title: "Upload once",
    description: "Bring in the resume you already have and let ResumeIQ parse the structure automatically."
  },
  {
    step: "02",
    title: "Inspect the signal",
    description: "See ATS readiness, missing keywords, strengths, weaknesses, and shareable analysis snapshots."
  },
  {
    step: "03",
    title: "Refine for the role",
    description: "Paste a target job description, rerun the analysis, and tighten the wording that matters most."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(138deg,rgba(255,255,255,0.95),rgba(244,249,252,0.86)_56%,rgba(255,245,238,0.86))] px-5 py-5 shadow-[0_34px_90px_rgba(9,21,35,0.14)] backdrop-blur-2xl sm:rounded-[2.8rem] sm:px-6 sm:py-6 lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute -left-16 top-12 h-44 w-44 rounded-full bg-tide/18 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-coral/16 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),transparent_45%,rgba(11,21,36,0.02))]" />
        <div className="relative">
          <div className="flex flex-col gap-4 border-b border-white/70 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="eyebrow-chip w-fit">
              <Sparkles className="h-4 w-4" />
              Resume intelligence for real job hunts
            </Link>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/80 bg-white/82 px-5 py-3 text-sm font-semibold text-ink shadow-[0_16px_32px_rgba(9,21,35,0.08)] hover:-translate-y-0.5 hover:bg-white sm:w-auto"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-950/5 bg-[linear-gradient(135deg,#081726,#0d7280)] px-5 py-3 text-sm font-semibold text-white shadow-[0_22px_42px_rgba(8,23,38,0.24)] hover:-translate-y-0.5 sm:w-auto"
              >
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/80 bg-white/72 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]">
                  ATS scoring
                </span>
                <span className="rounded-full border border-white/80 bg-white/72 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]">
                  AI rewrite support
                </span>
                <span className="rounded-full border border-white/80 bg-white/72 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]">
                  Live job alignment
                </span>
              </div>
              <h1 className="mt-6 max-w-5xl text-balance text-[2.95rem] font-semibold leading-[0.98] text-ink sm:text-[4.2rem] lg:text-[5.8rem]">
                ResumeIQ sharpens your resume, scores ATS readiness, and finds better-fit jobs.
              </h1>
              <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-slate-600 sm:text-lg">
                Upload your resume once, then get recruiter-style feedback, rewritten bullet points, keyword gap analysis,
                and live job matches tied directly to your skills.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-950/5 bg-[linear-gradient(135deg,#081726,#0d7280)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_24px_44px_rgba(8,23,38,0.26)] hover:-translate-y-0.5 sm:w-auto"
                >
                  Start improving now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/80 bg-white/82 px-6 py-3.5 text-sm font-semibold text-ink shadow-[0_16px_30px_rgba(9,21,35,0.08)] hover:-translate-y-0.5 hover:bg-white sm:w-auto"
                >
                  Open workspace
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="glass-stat">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Signal score</p>
                  <p className="mt-3 text-4xl font-semibold text-ink">84</p>
                  <p className="mt-2 text-sm text-slate-500">Typical ATS readiness snapshot after refinement.</p>
                </div>
                <div className="glass-stat">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Coverage</p>
                  <p className="mt-3 text-4xl font-semibold text-ink">85%</p>
                  <p className="mt-2 text-sm text-slate-500">Keyword alignment against a pasted role description.</p>
                </div>
                <div className="glass-stat">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Next move</p>
                  <p className="mt-3 text-xl font-semibold text-ink">Quantify impact</p>
                  <p className="mt-2 text-sm text-slate-500">Upgrade three bullets for stronger recruiter confidence.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="mesh-halo pointer-events-none absolute left-8 top-8 h-40 w-40 rounded-full bg-tide/20 blur-3xl" />
              <div className="float-slow relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(104,214,255,0.15),transparent_28%),linear-gradient(155deg,#081726,#10263b_52%,#0d7280)] p-6 text-white shadow-[0_32px_74px_rgba(7,18,30,0.34)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_40%)]" />
                <div className="relative">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">Hiring readiness report</p>
                      <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Avery Johnson</h2>
                      <p className="mt-2 text-sm text-slate-300">Full Stack Developer • React • Node • PostgreSQL</p>
                    </div>
                    <div className="w-full rounded-[1.5rem] bg-white/10 px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:w-auto sm:text-right">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-300">ATS</p>
                      <p className="mt-2 text-4xl font-semibold text-sun">84</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="dark-tile p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Strongest signal</p>
                      <p className="mt-3 text-xl font-semibold">Technical breadth</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Skills, project density, and role clarity are already doing heavy lifting.
                      </p>
                    </div>
                    <div className="dark-tile p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">Best-fit query</p>
                      <p className="mt-3 text-xl font-semibold">React Node developer jobs</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Generated directly from extracted skills and your target role pattern.
                      </p>
                    </div>
                  </div>

                  <div className="dark-tile mt-6 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Improvement stream</p>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                        Live guidance
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        "Add quantified outcomes to recent experience bullets.",
                        "Mirror missing keywords from the target job description.",
                        "Strengthen the summary with role-specific positioning."
                      ].map((item) => (
                        <div key={item} className="flex gap-3 rounded-2xl border border-white/8 bg-black/10 px-4 py-3 text-sm text-slate-200">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sun" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2.5rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(247,250,252,0.82))] p-6 shadow-[0_24px_64px_rgba(9,21,35,0.1)] backdrop-blur-2xl lg:p-8">
          <div className="flex items-center gap-3">
            <div className="eyebrow-chip">
              <ShieldCheck className="h-4 w-4" />
              What the product actually gives you
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="soft-tile"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mist text-tide shadow-[inset_0_1px_0_rgba(255,255,255,0.76)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-ink">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(104,214,255,0.16),transparent_28%),linear-gradient(160deg,#081726,#10263b_54%,#0d7280)] p-6 text-white shadow-[0_30px_76px_rgba(7,18,30,0.32)]">
          <div className="eyebrow-chip bg-white/10 text-white ring-1 ring-white/12 shadow-none">
            <WandSparkles className="h-4 w-4" />
            Designed for momentum
          </div>
          <div className="mt-6 space-y-4">
            {workflow.map((item) => (
              <div key={item.step} className="dark-tile">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">{item.step}</p>
                <h3 className="mt-3 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2.5rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(247,250,252,0.84))] px-6 py-8 shadow-[0_24px_64px_rgba(9,21,35,0.1)] backdrop-blur-2xl lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow-chip">
              <BriefcaseBusiness className="h-4 w-4" />
              Ready when your next application is
            </div>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.04] text-ink sm:text-5xl">
              Upgrade the UI of your job hunt and the quality of your resume at the same time.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Create a workspace, upload your current resume, and let ResumeIQ surface what recruiters and screening systems
              will notice first.
            </p>
          </div>
          <Link
            href="/signup"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-950/5 bg-[linear-gradient(135deg,#081726,#0d7280)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_22px_42px_rgba(8,23,38,0.24)] hover:-translate-y-0.5 sm:w-auto"
          >
            Create your workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
