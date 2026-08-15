import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const VARIAN: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-brand hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-600/50",
  secondary:
    "bg-brand-50 text-brand-800 hover:bg-brand-100 dark:bg-brand-900/40 dark:text-brand-100 dark:hover:bg-brand-900/70",
  ghost: "text-body hover:bg-surface-muted",
  danger: "bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700",
  outline: "border border-app-strong bg-surface text-body hover:bg-surface-muted",
};

const UKURAN: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-6 text-base gap-2.5",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-input)] font-semibold",
        "transition-all duration-150 active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-55",
        VARIAN[variant],
        UKURAN[size],
        className,
      )}
      {...props}
    />
  );
}
