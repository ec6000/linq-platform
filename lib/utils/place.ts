import { GeoPoint } from "firebase/firestore"
import type { Place } from "@/lib/types/common"
import { roundCoordinate } from "@/lib/utils/geo"

/**
 * What a public document may say about where someone is: the district, and
 * coordinates rounded to about a kilometre. Enough to sort by distance and to
 * check a radius, not enough to find a front door.
 */
export function publicPlace(place: Place): Place {
  const area = place.city || "Köln"
  return {
    geo: new GeoPoint(roundCoordinate(place.geo.latitude), roundCoordinate(place.geo.longitude)),
    address: area,
    city: area,
  }
}
