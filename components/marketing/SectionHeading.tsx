import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string | ReactNode;
  align?: "left" | "center";
  as?: "h2" | "h3";
  id?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  as: HeadingTag = "h2",
  id,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={`flex max-w-2xl flex-col gap-4 ${
        centered ? "mx-auto items-center text-center" : "items-start text-left"
      }`}
    >
      {eyebrow && (
        <span className={`eyebrow ${centered ? "eyebrow-plain" : ""}`}>{eyebrow}</span>
      )}

      <HeadingTag
        id={id}
        className="display text-[32px] leading-[1.1] text-primary md:text-[42px]"
      >
        {title}
      </HeadingTag>

      {description && (
        <p className="text-[16px] leading-relaxed text-text/65 md:text-[17px]">{description}</p>
      )}
    </div>
  );
}
