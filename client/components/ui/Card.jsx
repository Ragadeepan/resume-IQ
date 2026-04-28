import clsx from "clsx";

const tones = {
  default:
    "border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(247,250,252,0.8))] text-ink shadow-[0_28px_80px_rgba(9,21,35,0.12)] backdrop-blur-2xl",
  dark:
    "border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(104,214,255,0.16),transparent_28%),linear-gradient(155deg,#081726,#10263b_52%,#0d7280)] text-white shadow-[0_34px_90px_rgba(7,18,30,0.36)]",
  muted:
    "border-slate-200/70 bg-[linear-gradient(180deg,rgba(246,249,252,0.94),rgba(238,244,249,0.82))] text-ink shadow-[0_22px_54px_rgba(9,21,35,0.08)] backdrop-blur-xl"
};

const topGlow = {
  default: "via-white",
  dark: "via-white/30",
  muted: "via-white/80"
};

const orbTone = {
  default: "bg-white/25",
  dark: "bg-tide/20",
  muted: "bg-sky-100/50"
};

export function Card({ className, children, tone = "default" }) {
  return (
    <div
      className={clsx(
        "group relative overflow-hidden rounded-[1.7rem] border p-5 sm:rounded-[2rem] sm:p-6",
        tones[tone],
        className
      )}
    >
      <div
        className={clsx(
          "pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-90 sm:inset-x-6",
          topGlow[tone]
        )}
      />
      <div
        className={clsx(
          "pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full blur-2xl transition duration-500 group-hover:scale-110",
          orbTone[tone]
        )}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
