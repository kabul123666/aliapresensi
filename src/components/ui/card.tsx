import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface border-app rounded-[var(--radius-card)] border shadow-[var(--shadow-soft)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  judul,
  keterangan,
  aksi,
  className,
}: {
  judul: React.ReactNode;
  keterangan?: React.ReactNode;
  aksi?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}>
      <div className="min-w-0">
        <h2 className="text-body truncate text-base font-bold tracking-tight">{judul}</h2>
        {keterangan ? <p className="text-muted mt-0.5 text-sm">{keterangan}</p> : null}
      </div>
      {aksi}
    </div>
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
