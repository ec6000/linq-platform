"use client"

import { useState, useEffect, useRef } from "react"
import { X, Euro } from "lucide-react"
import { useOffer } from "@/lib/hooks/useOffers"

interface OfferModalProps {
  orderId: string
  orderTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function OfferModal({
  orderId,
  orderTitle,
  isOpen,
  onClose,
  onSuccess,
}: OfferModalProps) {
  const [priceInput, setPriceInput] = useState("")
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { createOffer, loading, error } = useOffer()
  const priceRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => priceRef.current?.focus(), 50)
    } else {
      setPriceInput("")
      setComment("")
      setSubmitted(false)
    }
  }, [isOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  // ✅ Early return NACH allen Hooks
  if (!isOpen) return null

  const priceInCent = Math.round(parseFloat(priceInput.replace(",", ".")) * 100)
  const isValid = !isNaN(priceInCent) && priceInCent > 0 && comment.trim().length < 200

  async function handleSubmit() {
    if (!isValid || loading) return
    try {
      await createOffer({ orderId, priceInCent, comment: comment.trim() })
      setSubmitted(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 200)
    } catch {
      // error wird vom Hook gesetzt
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-[2px] sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-t-3xl bg-background px-6 pb-8 pt-6 shadow-2xl sm:rounded-2xl">

        {/* Handle (mobile) */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-secondary sm:hidden" />

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-text">Angebot senden</h2>
            <p className="mt-0.5 text-[13px] text-text/50 line-clamp-1">{orderTitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-text/40 transition hover:bg-secondary hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preis */}
        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-medium text-text/60">
            Dein Preis
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-secondary bg-background px-4 py-3 transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
            <Euro size={15} className="shrink-0 text-text/30" />
            <input
              ref={priceRef}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className="w-full bg-transparent text-[15px] text-text outline-none placeholder:text-text/25"
            />
          </div>
        </div>

        {/* Kommentar */}
        <div className="mb-6">
          <label className="mb-1.5 block text-[13px] font-medium text-text/60">
            Kommentar (optional)
          </label>
          <div className="rounded-xl border border-secondary bg-background px-4 py-3 transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
            <textarea
              rows={3}
              placeholder="Warum bist du der Richtige für diesen Auftrag?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full resize-none bg-transparent text-[15px] text-text outline-none placeholder:text-text/25"
            />
          </div>
        </div>

        {error && (
          <p className="mb-4 text-[12px] text-red-500">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-secondary py-3 text-[14px] font-medium text-text/50 transition hover:bg-secondary"
          >
            Abbrechen
          </button>
          <button
            type="button"
            disabled={!isValid || loading || submitted}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-primary py-3 text-[14px] font-medium text-white transition hover:bg-primary/90 disabled:opacity-40"
          >
            {submitted ? "Gesendet ✓" : loading ? "…" : "Absenden"}
          </button>
        </div>
      </div>
    </div>
  )
}