import type { Category } from "@/lib/types/category"

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? ""
}

export function matchesCategoryIdentifier(category: Category, value?: string) {
  const target = normalize(value)
  if (!target) {
    return false
  }

  return [category.id, category.firestoreId].some((identifier) => normalize(identifier) === target)
}

export function findCategoryByOrderValue(categories: Category[], categoryValue?: string) {
  return categories.find((category) => matchesCategoryIdentifier(category, categoryValue))
}
