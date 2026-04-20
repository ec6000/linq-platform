import { JobStatus } from "@/lib/types/job"

export function getNextJobStatus(status: JobStatus): JobStatus | null {
  switch (status) {
    case JobStatus.open:
      return JobStatus.inProgress
    case JobStatus.inProgress:
      return JobStatus.done
    case JobStatus.done:
      return null
    case JobStatus.cancelled:
      return null
    default:
      return null
  }
}