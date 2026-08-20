import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Email Architect", short: "Email" },
  { to: "/summarizer", label: "Minute Master", short: "Notes" },
  { to: "/planner", label: "Pulse Planner", short: "Plan" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV.find((n) => n.to === pathname) ?? NAV[0];

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-3 p-6">
          <div className="flex size-8 items-center justify-center rounded bg-primary">
            <div className="size-4 rounded-sm border-2 border-primary-foreground" />
          </div>
          <span className="text-xl font-extrabold tracking-tighter">SENTINEL</span>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {NAV.map((item) => {
            const active = item.to === pathname;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  active
                    ? "flex items-center gap-3 rounded-md bg-primary/5 px-3 py-2 text-sm font-medium text-primary"
                    : "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                }
              >
                <span
                  className={
                    active
                      ? "size-1.5 rounded-full bg-primary"
                      : "size-1.5 rounded-full border border-muted-foreground"
                  }
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border p-4">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="size-8 rounded-full bg-secondary outline-1 outline-foreground/5" />
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold">Sarah Chen</p>
              <p className="truncate text-[10px] text-muted-foreground">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen min-w-0 flex-1 flex-col md:h-screen md:overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Tools</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="font-medium">{current.label}</span>
          </div>
          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-700">
            System Active
          </span>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-28 md:p-8 md:pb-8">{children}</div>

        <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 shadow-2xl md:hidden">
          {NAV.map((item) => {
            const active = item.to === pathname;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  active
                    ? "rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
                    : "rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground"
                }
              >
                {item.short}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
