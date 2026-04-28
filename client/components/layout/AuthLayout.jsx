import Link from "next/link";
import { FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function AuthLayout({
  eyebrow,
  title,
  description,
  asideTitle,
  asideDescription,
  asideItems = [],
  footer,
  children
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-start px-4 py-6 sm:px-6 sm:py-8 lg:items-center lg:px-8">
      <div className="grid w-full gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <Card tone="dark" className="order-2 relative overflow-hidden p-6 sm:p-8 lg:order-1 lg:p-10">
          <div className="mesh-halo pointer-events-none absolute -left-20 top-0 h-52 w-52 rounded-full bg-tide/30 blur-3xl" />
          <div className="mesh-halo pointer-events-none absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-coral/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%,rgba(255,255,255,0.02))]" />
          <div className="pointer-events-none absolute inset-y-10 right-10 hidden w-px bg-white/10 lg:block" />
          <div className="relative reveal-card">
            <Link href="/" className="eyebrow-chip bg-white/10 text-white ring-1 ring-white/15 shadow-none">
              <FileSearch className="h-4 w-4" />
              ResumeIQ
            </Link>

            <h1 className="mt-8 max-w-lg text-3xl font-semibold leading-[1.02] text-balance sm:text-4xl lg:text-[3.65rem]">
              {asideTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">{asideDescription}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-200">
                Calm onboarding
              </span>
              <span className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-200">
                Resume-first workflow
              </span>
            </div>

            <div className="mt-8 grid gap-3">
              {asideItems.map((item, index) => (
                <div
                  key={item}
                  className="dark-tile reveal-card flex gap-4 px-4 py-4 text-sm leading-6 text-slate-200 backdrop-blur"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xs font-semibold uppercase tracking-[0.26em] text-slate-200">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <div className="dark-tile">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-300">Signal</p>
                <p className="mt-3 text-3xl font-semibold">84</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Typical ATS benchmark after a tailored optimization pass.</p>
              </div>
              <div className="dark-tile">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-300">
                  <ShieldCheck className="h-4 w-4" />
                  Secure
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Tokens, verification, and account recovery stay woven into the flow.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="order-1 overflow-hidden p-0 lg:order-2">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,155,176,0.08),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,138,87,0.08),transparent_28%)]" />
          <div className="relative border-b border-slate-200/80 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="eyebrow-chip">
                <Sparkles className="h-4 w-4" />
                {eyebrow}
              </div>
              <span className="surface-badge self-start">Secure access flow</span>
            </div>
            <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.08] text-ink sm:text-4xl lg:text-[3.1rem]">{title}</h2>
            <p className="mt-4 max-w-2xl text-[1.02rem] leading-8 text-slate-600">{description}</p>
          </div>

          <div className="relative px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            {children}
            {footer ? <div className="mt-8 border-t border-slate-200/80 pt-6">{footer}</div> : null}
          </div>
        </Card>
      </div>
    </main>
  );
}
