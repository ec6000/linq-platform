export type Category = {
  id: string
  name: string
  subcategories: Subcategory[]
}

export type Subcategory = {
  id: string
  name: string
  categoryId: string
}