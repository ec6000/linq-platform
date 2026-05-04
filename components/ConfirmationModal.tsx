"use client"

interface ConfirmationModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationModal({ open, title, description, confirmLabel = "Bestätigen", cancelLabel = "Abbrechen", loading, onConfirm, onCancel }: ConfirmationModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="w-full max-w-md rounded-2xl border border-secondary bg-background p-5 shadow-xl">
        <h3 className="text-[17px] font-semibold text-text">{title}</h3>
        <p className="mt-2 text-[14px] text-text/65">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-secondary px-4 py-2 text-[13px] font-medium text-text/60 hover:bg-secondary">{cancelLabel}</button>
          <button type="button" onClick={onConfirm} disabled={loading} className="rounded-xl bg-primary px-4 py-2 text-[13px] font-medium text-white disabled:opacity-50">{loading ? "…" : confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
