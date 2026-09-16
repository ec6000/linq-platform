const sizes = {
  sm: "text-[22px]",
  md: "text-[26px]",
  lg: "text-[30px]",
} as const;

/**
 * The wordmark. The trailing dot is the one piece of the brand that is allowed
 * to move: it carries the accent colour and lifts on hover.
 */
export default function Logo({
  size = "md",
  className = "",
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span className={`logo ${sizes[size]} ${className}`}>
      LiNQ
      <span className="logo-dot" aria-hidden>
        .
      </span>
    </span>
  );
}
