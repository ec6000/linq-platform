export type Category = {
  id: string
  firestoreId?: string
  nameDE: string
  subcategories: Subcategory[]
}

export type Subcategory = {
  id: string
  nameDE: string
  categoryId: string
}
