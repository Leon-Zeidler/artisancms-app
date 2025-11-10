import React from 'react';

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  trend?: string;
  icon?: React.ElementType;
  accent?: 'orange' | 'emerald' | 'indigo';
};

const accentMap: Record<NonNullable<DashboardStatCardProps['accent']>, string> = {
  orange: 'bg-orange-500/10 text-orange-300',
  emerald: 'bg-emerald-500/10 text-emerald-300',
  indigo: 'bg-indigo-500/10 text-indigo-300',
};

export function DashboardStatCard({ title, value, description, trend, icon: Icon, accent = 'orange' }: DashboardStatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-800/80 p-6 shadow-lg shadow-slate-900/30">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent blur-2xl"
        aria-hidden="true"
      />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400/80">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
          {trend && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-slate-700 ${accentMap[accent]}`}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}

export default DashboardStatCard;
