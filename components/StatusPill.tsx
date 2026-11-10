/**
 * Every status in the product, in one table.
 *
 * Orders, offers, bookings, jobs and services share their status codes on
 * purpose ("open", "cancelled", …), so one map gives every list the same word
 * and the same colour for the same state.
 */
const STATUS = {
  open: ["Offen", "pill-accent"],
  pending: ["Offen", "pill-accent"],
  requested: ["Angefragt", "pill-accent"],
  scheduled: ["Geplant", "pill-accent"],
  assigned: ["Vergeben", "pill-primary"],
  accepted: ["Angenommen", "pill-success"],
  inProgress: ["In Arbeit", "pill-primary"],
  completed: ["Abgeschlossen", "pill-success"],
  active: ["Aktiv", "pill-success"],
  declined: ["Abgelehnt", "pill-muted"],
  cancelled: ["Storniert", "pill-muted"],
  paused: ["Pausiert", "pill-muted"],
  archived: ["Archiviert", "pill-muted"],
} as const satisfies Record<string, readonly [string, string]>

export type Status = keyof typeof STATUS

export function statusLabel(status: Status) {
  return STATUS[status]?.[0] ?? status
}

export default function StatusPill({ status }: { status: Status }) {
  const [label, tone] = STATUS[status] ?? [status, "pill-muted"]
  return <span className={`pill ${tone}`}>{label}</span>
}
