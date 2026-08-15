import { cn } from "@/lib/utils";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-body mb-1.5 block text-sm font-semibold", className)}
      {...props}
    />
  );
}

const dasarInput =
  "bg-surface border-app-strong text-body placeholder:text-subtle w-full rounded-[var(--radius-input)] border px-3.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-4 focus:ring-brand-500/12 disabled:opacity-60";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(dasarInput, "h-11", className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(dasarInput, "min-h-24 py-3", className)} {...props} />;
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(dasarInput, "h-11 pr-9", className)} {...props} />;
}

export function FieldError({ pesan }: { pesan?: string | null }) {
  if (!pesan) return null;
  return (
    <p className="text-danger-600 dark:text-danger-500 mt-1.5 text-sm font-medium">
      {pesan}
    </p>
  );
}

export function Hint({ children }: { children: React.ReactNode }) {
  return <p className="text-subtle mt-1.5 text-xs">{children}</p>;
}
