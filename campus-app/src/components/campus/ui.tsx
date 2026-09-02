import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/lost-found", label: "Lost & Found" },
  { to: "/parking", label: "Parking" },
  { to: "/maintenance", label: "Maintenance" },
  { to: "/study-rooms", label: "Study Rooms" },
  { to: "/canteen", label: "Canteen" },
  { to: "/safety", label: "Safety SOS" },
  { to: "/admin", label: "Admin" },
] as const;

export function Panel({
  title,
  hint,
  children,
  className = "",
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`mb-6 rounded-md border-2 border-primary bg-card p-5 shadow-block sm:p-6 ${className}`}
    >
      {title ? <h2 className="mt-0 mb-1 text-xl font-bold">{title}</h2> : null}
      {hint ? <p className="mb-3 text-sm text-muted-foreground">{hint}</p> : null}
      {children}
    </section>
  );
}

const stampTone: Record<string, string> = {
  lost: "text-alert border-alert",
  found: "text-ok border-ok",
  pending: "text-gold-deep border-gold-deep",
  claimed: "text-muted-foreground border-muted-foreground",
  approved: "text-info border-info",
  available: "text-ok border-ok",
  filling: "text-gold-deep border-gold-deep",
  full: "text-alert border-alert",
  quiet: "text-ok border-ok",
  moderate: "text-gold-deep border-gold-deep",
  packed: "text-alert border-alert",
  Reported: "text-alert border-alert",
  "In Progress": "text-info border-info",
  Resolved: "text-muted-foreground border-muted-foreground",
  Active: "text-alert border-alert",
};

export function Stamp({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span
      className={`stamp-text inline-block -rotate-3 rounded-sm border-2 px-2 py-0.5 text-[11px] ${
        stampTone[tone] ?? "text-muted-foreground border-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline" | "gold" | "chip";
  active?: boolean;
  size?: "md" | "sm";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

export function Btn({
  children,
  onClick,
  variant = "solid",
  active,
  size = "md",
  disabled,
  type = "button",
  className = "",
}: BtnProps) {
  const base =
    "stamp-text cursor-pointer rounded-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const sizes = size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-5 py-2.5 text-xs";
  const variants: Record<string, string> = {
    solid: "bg-primary text-primary-foreground hover:bg-primary/85",
    outline: "border-2 border-primary text-primary hover:bg-secondary",
    gold: "bg-gold-deep text-primary-foreground hover:bg-gold",
    chip: `rounded-full border-[1.5px] border-primary px-4 py-1.5 text-xs ${
      active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"
    }`,
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variant === "chip" ? "" : sizes} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-[9rem] flex-1">
      <span className="label-cap">{label}</span>
      {children}
    </div>
  );
}

export function Msg({ ok, children }: { ok?: boolean; children: ReactNode }) {
  return (
    <div
      className={`mt-3 rounded-sm px-3 py-2 text-sm ${
        ok ? "bg-ok-soft text-ok" : "bg-alert-soft text-alert"
      }`}
    >
      {children}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="stamp-text px-4 py-10 text-center text-xs text-muted-foreground">
      {children}
    </div>
  );
}

const NAV_STYLE: { on: string; off: string }[] = [
  { on: "bg-m2 text-primary-foreground", off: "bg-m2-soft text-primary" },
  { on: "bg-m1 text-primary-foreground", off: "bg-m1-soft text-primary" },
  { on: "bg-m2 text-primary-foreground", off: "bg-m2-soft text-primary" },
  { on: "bg-m3 text-primary-foreground", off: "bg-m3-soft text-primary" },
  { on: "bg-m4 text-primary-foreground", off: "bg-m4-soft text-primary" },
  { on: "bg-m5 text-primary-foreground", off: "bg-m5-soft text-primary" },
  { on: "bg-m6 text-primary-foreground", off: "bg-m6-soft text-primary" },
  { on: "bg-primary text-primary-foreground", off: "bg-secondary text-primary" },
];

export function Layout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen">
      <header className="px-3 sm:px-4 lg:px-6 pt-6 pb-4">
        <div className="hero-band mx-auto max-w-7xl rounded-xl border-2 border-primary px-6 py-7 text-center shadow-block-lg">
          <span className="stamp-text inline-block -rotate-2 rounded-full border-2 border-primary bg-card px-3 py-1 text-[11px]">
            Campus Toolkit · 6 modules
          </span>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Campus Problem Solver</h1>
          <div className="rainbow-rule mx-auto mt-3 w-40" />
          <p className="stamp-text mt-3 text-[11px] text-muted-foreground">
            Lost &amp; Found · Parking · Maintenance · Rooms · Canteen · Safety
          </p>
        </div>
        <nav className="mx-auto mt-5 flex max-w-7xl flex-wrap justify-center gap-2 px-2">
          {NAV.map((n, i) => {
            const active = pathname === n.to;
            const hue = NAV_STYLE[i] ?? NAV_STYLE[7]!;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`stamp-text rounded-full border-2 border-primary px-3.5 py-1.5 text-[11px] transition-transform hover:-translate-y-0.5 ${
                  active ? `${hue.on} shadow-block` : hue.off
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 pt-6 pb-20">{children}</main>
      <footer className="stamp-text pb-8 text-center text-[10px] text-muted-foreground">
        <span className="rainbow-rule mx-auto mb-4 block w-24" />
        Demo build · data stays in your browser
      </footer>
    </div>
  );
}
