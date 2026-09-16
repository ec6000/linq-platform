/**
 * Demo accounts.
 *
 * IDs are readable and prefixed so seeded users are obvious in the console and
 * trivially distinguishable from real Firebase Auth UIDs. These documents have
 * no auth account behind them: they exist to populate lists, and a real sign-up
 * always creates its own `users/{uid}`.
 */

export interface PersonSeed {
  id: string
  role: "provider" | "customer"
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
}

const provider = (
  id: string,
  firstName: string,
  lastName: string,
  company: string,
  phone: string,
): PersonSeed => ({
  id: `seed-p-${id}`,
  role: "provider",
  firstName,
  lastName,
  company,
  phone,
  email: `${id}@linq-demo.de`,
})

const customer = (id: string, firstName: string, lastName: string, phone: string): PersonSeed => ({
  id: `seed-c-${id}`,
  role: "customer",
  firstName,
  lastName,
  company: "",
  phone,
  email: `${id}@linq-demo.de`,
})

export const PROVIDERS: PersonSeed[] = [
  provider("lehmann", "Markus", "Lehmann", "Lehmann Transporte", "+49 221 1110001"),
  provider("yilmaz", "Elif", "Yilmaz", "Yilmaz Cleaning", "+49 221 1110002"),
  provider("becker", "Jonas", "Becker", "", "+49 221 1110003"),
  provider("novak", "Petra", "Novak", "Novak Gartenpflege", "+49 221 1110004"),
  provider("haddad", "Samir", "Haddad", "Haddad Handwerk", "+49 221 1110005"),
  provider("weber", "Lena", "Weber", "", "+49 221 1110006"),
]

export const CUSTOMERS: PersonSeed[] = [
  customer("schmidt", "Maria", "Schmidt", "+49 221 2220001"),
  customer("koch", "Thomas", "Koch", "+49 221 2220002"),
  customer("richter", "Anna", "Richter", "+49 221 2220003"),
  customer("aydin", "Deniz", "Aydin", "+49 221 2220004"),
  customer("fischer", "Paul", "Fischer", "+49 221 2220005"),
  customer("bauer", "Sophie", "Bauer", "+49 221 2220006"),
]

export const PEOPLE = [...PROVIDERS, ...CUSTOMERS]

export function personName(person: PersonSeed) {
  return `${person.firstName} ${person.lastName}`
}

const byId = new Map(PEOPLE.map((person) => [person.id, person]))

export function requirePerson(id: string): PersonSeed {
  const person = byId.get(id)
  if (!person) throw new Error(`Unbekannte Person "${id}" im Seed-Datensatz.`)
  return person
}
