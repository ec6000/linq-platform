import type { Category } from "@/lib/types/category"

/** Category and subcategory as one pair, so they can never disagree. */
export default function CategoryFields({
  categories,
  categoryId,
  subcategoryId,
  onChange,
  required,
}: {
  categories: Category[]
  categoryId: string
  subcategoryId: string
  onChange: (categoryId: string, subcategoryId: string) => void
  /** Whether a subcategory must be picked too. */
  required?: boolean
}) {
  const subcategories = categories.find((category) => category.id === categoryId)?.subcategories ?? []

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <label className="field-label" htmlFor="category">
          Kategorie
        </label>
        <select
          id="category"
          required
          value={categoryId}
          onChange={(event) => onChange(event.target.value, "")}
          className="field field-h field-select"
        >
          <option value="">Bitte wählen</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameDE}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="subcategory">
          Art
        </label>
        <select
          id="subcategory"
          required={required}
          disabled={subcategories.length === 0}
          value={subcategoryId}
          onChange={(event) => onChange(categoryId, event.target.value)}
          className="field field-h field-select"
        >
          <option value="">{required ? "Bitte wählen" : "Alle"}</option>
          {subcategories.map((subcategory) => (
            <option key={subcategory.slug} value={subcategory.slug}>
              {subcategory.nameDE}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
