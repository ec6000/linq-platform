export type Coordinates = { lat: number; lon: number }

export function haversineDistanceInKm(from: Coordinates, to: Coordinates) {
  const dLat = ((to.lat - from.lat) * Math.PI) / 180
  const dLon = ((to.lon - from.lon) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  const bounded = Math.min(1, Math.max(0, a))
  return 6371 * 2 * Math.atan2(Math.sqrt(bounded), Math.sqrt(1 - bounded))
}

/**
 * Two decimals is roughly a kilometre in Cologne: precise enough to sort by
 * distance and place a pin in the right district, too coarse to find a door.
 */
export function roundCoordinate(value: number) {
  return Math.round(value * 100) / 100
}
