import React from "react";

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  trend?: string;
  icon?: React.ElementType;
  accent?: "orange" | "emerald" | "indigo";
};

const accentMap: Record<
  NonNullable<DashboardStatCardProps["accent"]>,
  string
> = {
  orange: "bg-orange-100 text-orange-600",
  emerald: "bg-emerald-100 text-emerald-600",
  indigo: "bg-indigo-100 text-indigo-600",
};

export function DashboardStatCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  accent = "orange",
}: DashboardStatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-br from-orange-200/40 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {description && (
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          )}
          {trend && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <span
            className={`inline-flex size-12 items-center justify-center rounded-2xl ring-1 ring-slate-200 ${accentMap[accent]}`}
          >
            <Icon className="size-6" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}

export default DashboardStatCard;
