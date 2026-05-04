import { JobStatus } from "@/lib/types/job"

export function getNextJobStatus(status: JobStatus): JobStatus | null {
  switch (status) {
    case JobStatus.open:
      return JobStatus.inProgress
    case JobStatus.inProgress:
      return JobStatus.completed
    case JobStatus.completed:
      return null
    case JobStatus.cancelled:
      return null
    default:
      return null
  }
}