import { OrderStatus } from "@/lib/types/order"

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case OrderStatus.available:
      return OrderStatus.assigned
    case OrderStatus.assigned:
      return null // Kein weiterer Schritt – nur Stornieren möglich
    case OrderStatus.cancelled:
      return null
    default:
      return null
  }
}