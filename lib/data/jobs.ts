"use client"

import { doc, runTransaction, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"
import { requireAppUser } from "@/lib/firebase/currentUser"
import { JobSourceType, JobStatus } from "@/lib/types/job"
import { OrderStatus } from "@/lib/types/order"
import { canChangeJobStatus } from "@/lib/utils/jobStatus"

/** A job's status drives its order's status, so the two move together. */
const ORDER_STATUS_FOR_JOB: Partial<Record<JobStatus, OrderStatus>> = {
  [JobStatus.inProgress]: OrderStatus.inProgress,
  [JobStatus.completed]: OrderStatus.completed,
  [JobStatus.cancelled]: OrderStatus.cancelled,
}

export async function changeJobStatus(jobId: string, status: JobStatus) {
  const user = await requireAppUser("provider")

  await runTransaction(db, async (transaction) => {
    const ref = doc(db, "jobs", jobId)
    const job = (await transaction.get(ref)).data()
    if (!job || job.providerId !== user.uid) throw new Error("Job nicht gefunden.")
    if (!canChangeJobStatus(job.status, status)) {
      throw new Error("Der Jobstatus hat sich geändert. Bitte erneut prüfen.")
    }

    // A job that came from an order must still belong to this provider.
    const orderRef = job.sourceType === JobSourceType.order ? doc(db, "orders", job.sourceId) : null
    if (orderRef) {
      const order = (await transaction.get(orderRef)).data()
      if (!order || order.assignedProviderId !== user.uid) {
        throw new Error("Die Auftragszuordnung ist nicht mehr gültig.")
      }
    }

    transaction.update(ref, {
      status,
      updatedAt: serverTimestamp(),
      ...(status === JobStatus.inProgress ? { startedAt: serverTimestamp() } : {}),
      ...(status === JobStatus.completed ? { completedAt: serverTimestamp() } : {}),
      ...(status === JobStatus.cancelled ? { cancelledAt: serverTimestamp() } : {}),
    })

    const orderStatus = ORDER_STATUS_FOR_JOB[status]
    if (orderRef && orderStatus) {
      transaction.update(orderRef, {
        status: orderStatus,
        updatedAt: serverTimestamp(),
        ...(status === JobStatus.completed ? { completedAt: serverTimestamp() } : {}),
        ...(status === JobStatus.cancelled ? { cancelledAt: serverTimestamp() } : {}),
      })
    }
  })
}
