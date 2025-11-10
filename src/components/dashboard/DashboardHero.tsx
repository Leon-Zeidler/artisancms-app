import React from 'react';
import Link from 'next/link';

type HeroAction = {
  label: string;
  href?: string;
  icon?: React.ElementType;
  variant?: 'primary' | 'secondary';
  target?: string;
  onClick?: () => void;
};

type DashboardHeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: HeroAction[];
  children?: React.ReactNode;
};

const variantStyles: Record<NonNullable<HeroAction['variant']>, string> = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-orange-400 hover:text-orange-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200',
};

export function DashboardHero({ eyebrow, title, subtitle, actions, children }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-900/70 p-8 shadow-2xl shadow-slate-900/40">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.35),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-200">
                {eyebrow}
              </span>
            )}
            <h1 className="text-3xl font-bold text-white lg:text-4xl">{title}</h1>
            {subtitle && <p className="text-base text-slate-300 lg:max-w-3xl">{subtitle}</p>}
          </div>
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {actions.map(({ label, href, icon: Icon, variant = 'primary', target, onClick }) => {
                const className = variantStyles[variant];
                if (onClick || !href) {
                  return (
                    <button key={label} type="button" onClick={onClick} className={className}>
                      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                      {label}
                    </button>
                  );
                }

                return (
                  <Link key={label} href={href} target={target} className={className}>
                    {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export default DashboardHero;
