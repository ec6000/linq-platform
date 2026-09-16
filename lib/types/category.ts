/**
 * The service taxonomy.
 *
 * Subcategories are embedded in the category document rather than living in a
 * subcollection: the taxonomy is small, static and read on nearly every page,
 * so the whole tree should cost one query instead of one-per-category.
 */
export interface Subcategory {
  slug: string
  nameDE: string
  nameEN: string
}

export interface Category {
  /** Document ID and slug, e.g. "moving". */
  id: string
  nameDE: string
  nameEN: string
  /** Sort position in menus and filters. */
  order: number
  isActive: boolean
  subcategories: Subcategory[]
}

export function findCategory(categories: Category[], categoryId?: string) {
  if (!categoryId) return undefined
  return categories.find((category) => category.id === categoryId)
}

export function findSubcategory(categories: Category[], categoryId?: string, subcategoryId?: string) {
  if (!subcategoryId) return undefined
  return findCategory(categories, categoryId)?.subcategories.find(
    (subcategory) => subcategory.slug === subcategoryId,
  )
}
