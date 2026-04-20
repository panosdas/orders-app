import { getSupabaseAdminClient } from "@/lib/db"
import { TakeawayView } from "@/components/admin/takeaway-view"

export default async function AdminTakeawayPage() {
  const supabase = getSupabaseAdminClient()

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("PRODUCTS_CATEGORY").select("id, name").order("name"),
    supabase.from("PRODUCT").select("id, name, price, category").order("name"),
  ])

  return (
    <TakeawayView
      categories={(categories ?? []).map((c) => ({ id: String(c.id), name: c.name as string }))}
      products={(products ?? []).map((p) => ({
        id: String(p.id),
        name: p.name as string,
        price: p.price as number,
        categoryId: String(p.category),
      }))}
    />
  )
}
