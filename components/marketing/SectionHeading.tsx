import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string | ReactNode;
  align?: "left" | "center";
  as?: "h2" | "h3";
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: HeadingTag = "h2",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "text-center items-center" : "text-left items-start";

  return (
    <div className={`flex flex-col gap-3 ${alignment} max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>
      {eyebrow && (
        <span
          className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--accent)" }}
        >
          <span
            className="h-px w-6"
            style={{ background: "var(--accent)" }}
            aria-hidden
          />
          {eyebrow}
        </span>
      )}
      <HeadingTag
        className="text-[30px] md:text-[40px] font-semibold leading-[1.1] tracking-tight"
        style={{ color: "var(--primary)" }}
      >
        {title}
      </HeadingTag>
      {description && (
        <p
          className="text-[16px] md:text-[17px] leading-relaxed"
          style={{ color: "var(--text)", opacity: 0.7 }}
        >
          {description}
        </p>
      )}
    </div>
  );
}