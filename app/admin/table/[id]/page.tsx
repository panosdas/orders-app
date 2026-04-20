import { notFound } from "next/navigation"
import { getSupabaseAdminClient } from "@/lib/db"
import { OrderView } from "@/components/admin/order-view"
import type { ActiveOrder } from "@/lib/types"

interface TablePageProps {
  params: Promise<{ id: string }>
}

export default async function AdminTablePage({ params }: TablePageProps) {
  const { id } = await params
  const supabase = getSupabaseAdminClient()

  const [{ data: table }, { data: products }] = await Promise.all([
    supabase.from("RES_TABLE").select("id, table_num").eq("id", Number(id)).single(),
    supabase.from("PRODUCT").select("id, name, price").order("name"),
  ])

  if (!table) notFound()

  const productNameMap = new Map((products ?? []).map((p) => [p.id as number, p.name as string]))

  type OrderRow = {
    id: number
    status: string
    total_price: number
    user: number
    PRODUCTS_ORDER: Array<{ product: number; quantity: number; price: number; comment: string | null }>
  }

  const { data: mainOrder } = await supabase
    .from("PARAGELIA")
    .select("id, status, total_price, user, PRODUCTS_ORDER(product, quantity, price, comment)")
    .eq("table", Number(id))
    .in("status", ["active", "paid"])
    .is("parent_order", null)
    .maybeSingle()

  if (!mainOrder) notFound()

  const main = mainOrder as unknown as OrderRow

  const [{ data: subOrdersData }, { data: waiterData }] = await Promise.all([
    supabase
      .from("PARAGELIA")
      .select("id, total_price, PRODUCTS_ORDER(product, quantity, price, comment)")
      .eq("parent_order", main.id),
    supabase.from("USER").select("name").eq("id", main.user).single(),
  ])

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

  const activeOrder: ActiveOrder = {
    id: String(main.id),
    status: main.status,
    items: allItems,
    grandTotal,
  }

  return (
    <OrderView
      tableNum={String(table.table_num)}
      waiterName={(waiterData?.name as string) ?? ""}
      order={activeOrder}
    />
  )
}
