import { categorySchema } from "@/lib/validations";

export function parseCategoryFormData(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    sort_order: formData.get("sort_order") ?? 0,
    is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
  });
}
