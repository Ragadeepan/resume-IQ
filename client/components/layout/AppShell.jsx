"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { BarChart3, BriefcaseBusiness, FileSearch, Lightbulb, LogOut, UploadCloud } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

const navigation = [
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { href: "/suggestions", label: "Suggestions", icon: Lightbulb }
];

export function AppShell({ title, description, children, actions = null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const activeNavigation = navigation.find((item) => pathname.startsWith(item.href));

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[2.1rem] border border-white/70 bg-[linear-gradient(138deg,rgba(255,255,255,0.94),rgba(245,249,252,0.86)_56%,rgba(255,245,238,0.86))] p-5 shadow-[0_30px_90px_rgba(9,21,35,0.14)] backdrop-blur-2xl sm:rounded-[2.75rem] sm:p-6 lg:p-8">
        <div className="float-slow pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-tide/20 blur-3xl" />
        <div className="float-slow pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-coral/18 blur-3xl [animation-delay:1.2s]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.48),transparent_42%,rgba(10,23,39,0.03))]" />
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300/70 to-transparent" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <Link href="/" className="eyebrow-chip">
              <FileSearch className="h-4 w-4" />
              ResumeIQ
            </Link>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/80 bg-white/66 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                Adaptive workspace
              </span>
              <span className="rounded-full border border-white/80 bg-white/66 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                ATS intelligence
              </span>
              {activeNavigation ? (
                <span className="rounded-full border border-white/80 bg-white/66 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
                  Current: {activeNavigation.label}
                </span>
              ) : null}
            </div>
            <h1 className="mt-5 max-w-4xl text-3xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-4xl lg:text-[3.55rem]">{title}</h1>
            <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-slate-600">{description}</p>
          </div>

          <div className="grid gap-3 xl:min-w-[320px] xl:max-w-sm">
            <div className="soft-tile p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Signed in as</p>
              <p className="mt-2 text-lg font-semibold text-ink [overflow-wrap:anywhere]">{user?.name || "ResumeIQ user"}</p>
              <p className="mt-1 text-sm text-slate-500 [overflow-wrap:anywhere]">{user?.email || "Workspace active"}</p>
            </div>
            <div className="soft-tile p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Workspace mode</p>
              <p className="mt-2 text-lg font-semibold text-ink">{activeNavigation?.label || "Resume workspace"}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Move between upload, scoring, job search, and rewrites without losing the active resume context.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>*]:w-full [&>*]:justify-center sm:[&>*]:w-auto sm:[&>*]:justify-center">
              {actions}
              <Button
                variant="ghost"
                className="w-full rounded-full bg-white/72 text-slate-700 ring-1 ring-white/80 hover:bg-white sm:w-auto"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        <nav className="relative mt-8 grid gap-3 min-[520px]:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))]">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "inline-flex min-h-[72px] min-w-0 items-center gap-3 rounded-[1.6rem] border px-4 py-4 text-sm font-semibold transition hover:-translate-y-0.5",
                  active
                    ? "border-white/10 bg-[linear-gradient(135deg,#081726,#0d7280)] text-white shadow-[0_24px_46px_rgba(8,23,38,0.24)]"
                    : "border-white/80 bg-white/72 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] hover:bg-white"
                )}
              >
                <span
                  className={clsx(
                    "flex h-11 w-11 items-center justify-center rounded-2xl",
                    active ? "bg-white/12" : "bg-slate-100 text-tide"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span>{item.label}</span>
                  <span className={clsx("text-xs font-medium", active ? "text-slate-200" : "text-slate-400")}>
                    Workspace module
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mt-6">{children}</main>
    </div>
  );
}
