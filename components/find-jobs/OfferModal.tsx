"use client"

import { useEffect, useRef, useState } from "react"
import { Euro, X } from "lucide-react"
import { parseEuroInCent } from "@/lib/utils/validation"
import { useOfferActions } from "@/lib/hooks/useOffers"

interface OfferModalProps {
  orderId: string
  orderTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const MAX_MESSAGE_LENGTH = 500

export default function OfferModal({
  orderId,
  orderTitle,
  isOpen,
  onClose,
  onSuccess,
}: OfferModalProps) {
  const [priceInput, setPriceInput] = useState("")
  const [message, setMessage] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { submitOffer, loading, error } = useOfferActions()
  const priceRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      const focusTimer = setTimeout(() => priceRef.current?.focus(), 50)
      return () => clearTimeout(focusTimer)
    }

    const resetTimer = window.setTimeout(() => {
      setPriceInput("")
      setMessage("")
      setSubmitted(false)
    }, 0)
    return () => window.clearTimeout(resetTimer)
  }, [isOpen])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (isOpen && !loading && event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, loading, onClose])

  // Early return AFTER all hooks.
  if (!isOpen) return null

  let priceInCent = 0
  try {
    priceInCent = parseEuroInCent(priceInput)
  } catch {
    /* Invalid input keeps submission disabled. */
  }
  const isValid = priceInCent > 0 && message.trim().length <= MAX_MESSAGE_LENGTH

  async function handleSubmit() {
    if (!isValid || loading) return
    if (await submitOffer(orderId, priceInCent, message)) {
      setSubmitted(true)
      setTimeout(() => {
        onSuccess?.()
        onClose()
      }, 250)
    }
  }

  return (
    <div
      className="overlay items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-modal-title"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="sheet w-full max-w-lg p-6 md:p-7">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="offer-modal-title" className="text-[18px] font-semibold text-text">
              Angebot senden
            </h2>
            <p className="mt-0.5 line-clamp-1 text-[13px] text-text/50">{orderTitle}</p>
          </div>
          <button type="button" onClick={onClose} className="icon-btn -mr-1.5" aria-label="Schließen">
            <X size={18} strokeWidth={1.9} aria-hidden />
          </button>
        </div>

        <div className="mb-5">
          <label className="field-label" htmlFor="offer-price">
            Dein Preis
          </label>
          <div className="field-group field-h">
            <Euro size={15} strokeWidth={1.8} className="flex-none text-text/30" aria-hidden />
            <input
              id="offer-price"
              ref={priceRef}
              inputMode="decimal"
              placeholder="0,00"
              value={priceInput}
              onChange={(event) => setPriceInput(event.target.value)}
              className="num"
            />
          </div>
        </div>

        <div className="mb-7">
          <label className="field-label" htmlFor="offer-message">
            Kommentar <span className="font-normal text-text/40">(optional)</span>
          </label>
          <textarea
            id="offer-message"
            rows={3}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Warum bist du der Richtige für diesen Auftrag?"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="field resize-none"
          />
          <p className="field-hint mt-1.5 text-right">
            {message.length} / {MAX_MESSAGE_LENGTH}
          </p>
        </div>

        {error && (
          <p role="alert" className="notice notice-error mb-5">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn btn-outline btn-lg flex-1">
            Abbrechen
          </button>
          <button
            type="button"
            disabled={!isValid || loading || submitted}
            onClick={handleSubmit}
            className="btn btn-primary btn-lg flex-1"
          >
            {submitted ? "Gesendet" : loading ? "Wird gesendet…" : "Absenden"}
          </button>
        </div>
      </div>
    </div>
  )
}
