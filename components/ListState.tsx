/** One loading / error / empty treatment for every list. Renders nothing once there is data. */
export default function ListState({
  loading,
  error,
  empty,
  emptyText,
  children,
}: {
  loading: boolean
  error: string | null
  empty: boolean
  emptyText: string
  /** Optional action under the empty text, e.g. "Ersten Auftrag erstellen". */
  children?: React.ReactNode
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="skeleton h-40 rounded-xl" />
        ))}
      </div>
    )
  }
  if (error) {
    return (
      <p role="alert" className="notice notice-error">
        {error}
      </p>
    )
  }
  if (!empty) return null
  return (
    <div className="empty">
      <p className="mx-auto max-w-sm text-[15px] leading-relaxed text-text/50">{emptyText}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}
