import { Timestamp } from "firebase/firestore"

export interface Job {
  id: string
  title: string
  customerName: string
  status: JobStatus
  date: Timestamp
  priceInCent: number
  categoryId: string
}

export enum JobStatus {
  open = "open",
  inProgress = "in progress",
  done = "done",
  cancelled = "cancelled",
}