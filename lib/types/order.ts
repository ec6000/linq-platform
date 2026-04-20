import { Timestamp, GeoPoint } from "firebase/firestore"
import { Category } from "./category"

export interface Order {
  id: string
  title: string
  customerName: string
  status: OrderStatus
  date: Timestamp
  budgetInCent: number
  location: GeoPoint
  categoryId: string
}

export enum OrderStatus {
  available = "available",
  assigned = "assigned",
  cancelled = "cancelled",
}