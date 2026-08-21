import { useState, type ReactNode } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const controlClass =
  "w-full rounded-lg border border-border bg-card p-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20";

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <select className={controlClass} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      className={controlClass}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 8,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      className="w-full rounded-lg border border-border bg-card p-4 text-sm shadow-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function InputPanel({
  title,
  subtitle,
  children,
  onGenerate,
  loading,
  disabled,
  actionLabel,
  onReset,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  onGenerate: () => void;
  loading: boolean;
  disabled: boolean;
  actionLabel: string;
  onReset?: () => void;
}) {
  return (
    <section className="animate-slide-up w-full space-y-6 lg:col-span-5">
      <div>
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {children}
        <div className="flex gap-3">
          <button
            onClick={onGenerate}
            disabled={loading || disabled}
            className="flex-1 cursor-pointer rounded-lg bg-foreground py-3 font-semibold text-background shadow-lg transition-all hover:bg-foreground/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Generating…" : actionLabel}
          </button>
          {onReset ? (
            <button
              onClick={onReset}
              disabled={loading}
              className="cursor-pointer rounded-lg border border-border bg-card px-6 py-3 font-semibold text-muted-foreground transition-all hover:bg-foreground/5 hover:text-foreground active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function OutputPanel({
  badge,
  value,
  onChange,
  loading,
  error,
  emptyHint,
  onRegenerate,
  disclaimer,
}: {
  badge: string;
  value: string;
  onChange: (value: string) => void;
  loading: boolean;
  error: string | null;
  emptyHint: string;
  onRegenerate: () => void;
  disclaimer: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="animate-slide-up w-full lg:col-span-7">
      <div className="flex min-h-[540px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
              AI
            </span>
            <span className="text-xs font-semibold text-muted-foreground">{badge}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onRegenerate}
              disabled={loading}
              className="rounded p-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-40"
            >
              <span className="px-1">Regenerate</span>
            </button>
            <button
              onClick={copy}
              disabled={!value}
              className="rounded p-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-40"
            >
              <span className="px-1">{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8">
          {error ? (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {loading && !value ? (
            <div className="space-y-3">
              {[90, 75, 96, 60, 82].map((w, i) => (
                <div
                  key={i}
                  className="h-3 animate-pulse rounded bg-secondary"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          ) : value ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              spellCheck
              className="h-full min-h-[380px] w-full resize-none whitespace-pre-wrap bg-transparent text-sm leading-relaxed outline-none"
            />
          ) : (
            <p className="max-w-[46ch] text-sm leading-relaxed text-muted-foreground/70">
              {emptyHint}
            </p>
          )}
        </div>

        <div className="border-t border-border bg-secondary/40 px-6 py-4 md:px-8">
          <div className="flex gap-3">
            <span className="shrink-0 text-amber-600">ⓘ</span>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export const DISCLAIMER =
  "AI content can be inaccurate. Please review and verify every generated output before sending, sharing or acting on it. AI Workplace Productivity Assistant is designed for workplace assistance and does not represent final legal, financial or binding intent. Do not paste confidential personal data.";
