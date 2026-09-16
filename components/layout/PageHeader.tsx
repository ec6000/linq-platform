import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Count shown next to the title, e.g. how many results a filter left. */
  count?: number;
  actions?: ReactNode;
}

/**
 * One heading treatment for every signed-in page, so the app reads as one product.
 * No icon, no chrome: the title carries it.
 */
export default function PageHeader({ title, description, count, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="page-title">{title}</h1>
          {typeof count === "number" && (
            <span className="pill pill-primary num mt-0.5">{count}</span>
          )}
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-text/55">{description}</p>
        )}
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
