/** Real Cologne districts, so radius filters and the map behave like production. */

export interface DistrictSeed {
  key: string
  city: string
  lat: number
  lon: number
  streets: string[]
}

export const DISTRICTS: DistrictSeed[] = [
  { key: "innenstadt", city: "Köln Innenstadt", lat: 50.9375, lon: 6.9603, streets: ["Hohe Str. 112", "Neumarkt 18", "Zeughausstr. 5"] },
  { key: "ehrenfeld", city: "Köln Ehrenfeld", lat: 50.9525, lon: 6.9175, streets: ["Venloer Str. 271", "Körnerstr. 44", "Subbelrather Str. 15"] },
  { key: "nippes", city: "Köln Nippes", lat: 50.9705, lon: 6.952, streets: ["Neusser Str. 340", "Florastr. 22", "Turmstr. 9"] },
  { key: "suelz", city: "Köln Sülz", lat: 50.9128, lon: 6.9243, streets: ["Zülpicher Str. 380", "Berrenrather Str. 178", "Sülzburgstr. 61"] },
  { key: "lindenthal", city: "Köln Lindenthal", lat: 50.928, lon: 6.901, streets: ["Dürener Str. 210", "Gleueler Str. 88", "Stadtwaldgürtel 33"] },
  { key: "deutz", city: "Köln Deutz", lat: 50.939, lon: 6.975, streets: ["Deutzer Freiheit 72", "Siegburger Str. 40", "Mindener Str. 12"] },
  { key: "muelheim", city: "Köln Mülheim", lat: 50.97, lon: 7.0, streets: ["Frankfurter Str. 95", "Buchheimer Str. 20", "Wallstr. 8"] },
  { key: "kalk", city: "Köln Kalk", lat: 50.94, lon: 7.01, streets: ["Kalker Hauptstr. 55", "Vietorstr. 14", "Manteuffelstr. 3"] },
  { key: "rodenkirchen", city: "Köln Rodenkirchen", lat: 50.888, lon: 6.993, streets: ["Hauptstr. 48", "Uferstr. 7", "Ringstr. 26"] },
  { key: "bayenthal", city: "Köln Bayenthal", lat: 50.908, lon: 6.976, streets: ["Bayenthalgürtel 12", "Goltsteinstr. 140", "Schönhauser Str. 30"] },
  { key: "porz", city: "Köln Porz", lat: 50.886, lon: 7.057, streets: ["Hauptstr. 320", "Bahnhofstr. 19", "Friedrichstr. 6"] },
  { key: "chorweiler", city: "Köln Chorweiler", lat: 51.029, lon: 6.894, streets: ["Mailänder Passage 1", "Pariser Platz 4", "Merianstr. 17"] },
]

const byKey = new Map(DISTRICTS.map((district) => [district.key, district]))

export function requireDistrict(key: string): DistrictSeed {
  const district = byKey.get(key)
  if (!district) throw new Error(`Unbekannter Stadtteil "${key}" im Seed-Datensatz.`)
  return district
}

/** A stable address inside a district — same input, same output on every run. */
export function addressIn(districtKey: string, index: number) {
  const district = requireDistrict(districtKey)
  const street = district.streets[index % district.streets.length]
  return { address: `${street}, ${district.city}`, city: district.city }
}
