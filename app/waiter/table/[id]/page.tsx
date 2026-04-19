import { notFound } from "next/navigation"
import { getSupabaseAdminClient } from "@/lib/db"
import { TableContent } from "@/components/waiter/table-content"
import type { ActiveOrder } from "@/lib/types"

interface TablePageProps {
  params: Promise<{ id: string }>
}

export default async function TablePage({ params }: TablePageProps) {
  const { id } = await params
  const supabase = getSupabaseAdminClient()

  const [{ data: table }, { data: categories }, { data: products }] = await Promise.all([
    supabase.from("RES_TABLE").select("id, table_num").eq("id", Number(id)).single(),
    supabase.from("PRODUCTS_CATEGORY").select("id, name").order("name"),
    supabase.from("PRODUCT").select("id, name, price, category").order("name"),
  ])

  if (!table) notFound()

  const productNameMap = new Map((products ?? []).map((p) => [p.id as number, p.name as string]))

  type OrderRow = {
    id: number
    status: string
    total_price: number
    PRODUCTS_ORDER: Array<{ product: number; quantity: number; price: number; comment: string | null }>
  }

  const { data: mainOrder } = await supabase
    .from("PARAGELIA")
    .select("id, status, total_price, PRODUCTS_ORDER(product, quantity, price, comment)")
    .eq("table", Number(id))
    .not("status", "in", "(completed)")
    .is("parent_order", null)
    .maybeSingle()

  let activeOrder: ActiveOrder | null = null

  if (mainOrder) {
    const main = mainOrder as unknown as OrderRow

    const { data: subOrdersData } = await supabase
      .from("PARAGELIA")
      .select("id, total_price, PRODUCTS_ORDER(product, quantity, price, comment)")
      .eq("parent_order", main.id)

    const subOrders = (subOrdersData ?? []) as unknown as OrderRow[]

    const mapItems = (rows: OrderRow["PRODUCTS_ORDER"]) =>
      rows.map((po) => ({
        productId: String(po.product),
        productName: productNameMap.get(po.product) ?? `#${po.product}`,
        quantity: po.quantity,
        unitPrice: po.price,
        comment: po.comment ?? null,
      }))

    const allItems = [
      ...mapItems(main.PRODUCTS_ORDER ?? []),
      ...subOrders.flatMap((so) => mapItems(so.PRODUCTS_ORDER ?? [])),
    ]

    const grandTotal =
      main.total_price + subOrders.reduce((sum, so) => sum + (so.total_price ?? 0), 0)

    activeOrder = { id: String(main.id), status: main.status, items: allItems, grandTotal }
  }

  return (
    <TableContent
      table={{ id: String(table.id), name: String(table.table_num), status: "available" }}
      categories={(categories ?? []).map((c) => ({ id: String(c.id), name: c.name as string }))}
      products={(products ?? []).map((p) => ({
        id: String(p.id),
        name: p.name as string,
        price: p.price as number,
        categoryId: String(p.category),
      }))}
      activeOrder={activeOrder}
    />
  )
}
