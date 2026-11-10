import { JobStatus } from "@/lib/types/job"
import type { UserRole } from "@/lib/types/user"

/** The one step a job can take forward, or null if it is finished. */
export function getNextJobStatus(status: JobStatus): JobStatus | null {
  if (status === JobStatus.scheduled) return JobStatus.inProgress
  if (status === JobStatus.inProgress) return JobStatus.completed
  return null
}

export function isTerminalJobStatus(status: JobStatus) {
  return status === JobStatus.completed || status === JobStatus.cancelled
}

/**
 * Jobs move forward one step at a time and never back. The provider drives
 * them; the customer can only call a job off before work has started.
 * firestore.rules enforces the same table.
 */
export function canChangeJobStatus(current: JobStatus, next: JobStatus, role: UserRole = "provider") {
  if (isTerminalJobStatus(current)) return false
  if (role === "customer") return current === JobStatus.scheduled && next === JobStatus.cancelled
  return next === JobStatus.cancelled || getNextJobStatus(current) === next
}
