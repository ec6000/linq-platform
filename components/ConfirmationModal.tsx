"use client"

import { useEffect, useId, useRef } from "react"

interface ConfirmationModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** Renders the confirm action in red, for anything that destroys or cancels. */
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  destructive = false,
  loading,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return
    dialog.showModal()
    return () => {
      dialog.close()
    }
  }, [open])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 m-auto w-full max-w-md bg-transparent p-4 backdrop:bg-primary-deep/35 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault()
        if (!loading) onCancel()
      }}
    >
      <div className="sheet w-full p-6">
        <h3 id={titleId} className="text-[17px] font-semibold text-text">
          {title}
        </h3>
        <p className="mt-2 text-[14px] leading-relaxed text-text/60">{description}</p>

        <div className="mt-7 flex justify-end gap-2">
          <button type="button" disabled={loading} onClick={onCancel} className="btn btn-ghost">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`btn ${destructive ? "btn-danger-solid" : "btn-primary"}`}
          >
            {loading ? "Einen Moment…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
