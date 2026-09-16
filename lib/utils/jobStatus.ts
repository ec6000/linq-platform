import { JobStatus } from "@/lib/types/job"

/** The one step a job can take forward, or null if it is finished. */
export function getNextJobStatus(status: JobStatus): JobStatus | null {
  switch (status) {
    case JobStatus.scheduled:
      return JobStatus.inProgress
    case JobStatus.inProgress:
      return JobStatus.completed
    default:
      return null
  }
}

/**
 * Jobs move forward one step at a time, and can be cancelled from any state
 * that is not already terminal. Nothing ever moves backwards.
 */
export function canChangeJobStatus(current: JobStatus, next: JobStatus) {
  if (current === next) return false
  if (isTerminalJobStatus(current)) return false
  if (next === JobStatus.cancelled) return true
  return getNextJobStatus(current) === next
}

export function isTerminalJobStatus(status: JobStatus) {
  return status === JobStatus.completed || status === JobStatus.cancelled
}
