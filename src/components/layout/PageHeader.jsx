'use client'

import Link from 'next/link'

export default function PageHeader({
  title,
  subtitle,
  breadcrumbLabel,
  backHref,
  backLabel,
  action,
}) {
  return (
    <section className="bg-white rounded-b-[28px] sm:rounded-b-[36px] border-b border-[var(--rh-border)] shadow-[0_6px_22px_rgba(26,66,138,0.06)] pt-4 pb-6 sm:pt-5 sm:pb-8">
      <div className="rh-container">
        {backHref ? (
          <Link
            href={backHref}
            style={{ color: 'var(--rh-blue)' }}
            className="inline-flex items-center gap-1.5 text-xs font-bold no-underline hover:underline mb-2.5"
          >
            <span>&larr;</span>
            <span>{backLabel || 'Kembali'}</span>
          </Link>
        ) : (
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--rh-text-3)] mb-2">
            <Link
              href="/"
              style={{ color: 'var(--rh-text-3)' }}
              className="no-underline hover:underline"
            >
              Beranda
            </Link>
            <span>/</span>
            <span className="text-[var(--rh-orange)] font-semibold">{breadcrumbLabel || title}</span>
          </nav>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--rh-blue)] tracking-tight m-0">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[var(--rh-text)] opacity-75 m-0 max-w-lg">
                {subtitle}
              </p>
            )}
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </section>
  )
}
