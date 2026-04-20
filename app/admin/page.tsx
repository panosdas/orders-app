import { getSupabaseAdminClient } from "@/lib/db"
import { TablesGrid } from "@/components/admin/tables-grid"

export default async function AdminTablesPage() {
  const supabase = getSupabaseAdminClient()

  const [{ data: tables }, { data: allOrders }] = await Promise.all([
    supabase.from("RES_TABLE").select("id, table_num").order("table_num"),
    supabase
      .from("PARAGELIA")
      .select("table, status, user")
      .in("status", ["active", "paid"])
      .is("parent_order", null),
  ])

  const userIds = [...new Set((allOrders ?? []).map((o) => o.user as number).filter(Boolean))]

  const userNameMap = new Map<number, string>()
  if (userIds.length > 0) {
    const { data: users } = await supabase.from("USER").select("id, name").in("id", userIds)
    ;(users ?? []).forEach((u) => userNameMap.set(u.id as number, u.name as string))
  }

  const tablesWithStatus = (tables ?? []).map((table) => {
    const orders = (allOrders ?? []).filter((o) => o.table === table.id)

    if (orders.length === 0) {
      return { ...table, status: "available" as const, waiterName: undefined }
    }

    const activeOrder = orders.find((o) => o.status === "active")
    if (activeOrder) {
      return {
        ...table,
        status: "active" as const,
        waiterName: userNameMap.get(activeOrder.user as number),
      }
    }

    return {
      ...table,
      status: "paid" as const,
      waiterName: userNameMap.get(orders[0].user as number),
    }
  })

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Τραπέζια</h1>
      <TablesGrid tables={tablesWithStatus} />
    </div>
  )
}
