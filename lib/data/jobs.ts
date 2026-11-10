"use client"

import { doc, runTransaction, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { requireAppUser } from "@/lib/firebase/currentUser"
import { JobSourceType, JobStatus } from "@/lib/types/job"
import { canChangeJobStatus } from "@/lib/utils/jobStatus"

const STAMP: Partial<Record<JobStatus, string>> = {
  [JobStatus.inProgress]: "startedAt",
  [JobStatus.completed]: "completedAt",
  [JobStatus.cancelled]: "cancelledAt",
}

/**
 * The provider moves a job forward; either side may call it off before it is
 * done. A job from an order carries its order along, because the two status
 * names are the same and the customer reads the order, not the job.
 */
export async function changeJobStatus(jobId: string, status: JobStatus) {
  const user = await requireAppUser()

  await runTransaction(db, async (transaction) => {
    const ref = doc(db, "jobs", jobId)
    const job = (await transaction.get(ref)).data()
    const isProvider = job?.providerId === user.uid
    if (!job || (!isProvider && job.customerId !== user.uid)) throw new Error("Job nicht gefunden.")
    if (!canChangeJobStatus(job.status, status, isProvider ? "provider" : "customer")) {
      throw new Error("Der Jobstatus hat sich geändert. Bitte erneut prüfen.")
    }

    const stamp = STAMP[status]
    const change = { status, updatedAt: serverTimestamp(), ...(stamp ? { [stamp]: serverTimestamp() } : {}) }
    transaction.update(ref, change)

    if (job.sourceType === JobSourceType.order) transaction.update(doc(db, "orders", job.sourceId), change)
  })
}
