import { Timestamp, GeoPoint } from "firebase/firestore"

export interface Order {
  id: string
  title: string
  description: string
  customerName: string
  customerId: string
  status: OrderStatus
  priority: OrderPriority
  
  // Zeitfenster statt einzelnem Datum
  timeWindow: {
    start: Timestamp
    end: Timestamp
    isFlexible: boolean
  }
  
  // Budget
  budgetInCent: number
  
  // Standort mit Radius (in Metern)
  location: GeoPoint
  address?: string
  radiusInMeters: number
  
  // Kategorisierung
  categoryId: string
  subcategoryId: string
  
  // Bilder
  imageUrls: string[]
  thumbnailUrl?: string
  
  // Assignment
  assignedProviderId?: string
  assignedAt?: Timestamp
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  cancelledAt?: Timestamp
}

export enum OrderStatus {
  available = "available",
  assigned = "assigned",
  inProgress = "inProgress",
  completed = "completed",
  cancelled = "cancelled",
}

export enum OrderPriority {
  low = "low",
  normal = "normal",
  high = "high",
  urgent = "urgent",
}