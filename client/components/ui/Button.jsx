"use client";

import clsx from "clsx";

const variants = {
  primary:
    "border border-slate-950/5 bg-[linear-gradient(135deg,#081726,#0d7280)] text-white shadow-[0_22px_42px_rgba(8,23,38,0.26)] hover:shadow-[0_26px_50px_rgba(8,23,38,0.32)]",
  accent:
    "border border-orange-200/40 bg-[linear-gradient(135deg,#ff925a,#f7cb73)] text-ink shadow-[0_20px_40px_rgba(255,138,87,0.22)] hover:shadow-[0_24px_46px_rgba(255,138,87,0.28)]",
  secondary:
    "border border-white/80 bg-white/84 text-ink shadow-[0_16px_32px_rgba(9,21,35,0.08)] hover:bg-white",
  ghost: "border border-slate-200/70 bg-white/36 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.54)] hover:bg-white/76"
};

export function Button({ className, variant = "primary", ...props }) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full px-5 py-3 text-center text-sm font-semibold leading-5 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-tide/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
