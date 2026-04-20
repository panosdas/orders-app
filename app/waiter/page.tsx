import { cookies } from "next/headers"
import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "@/lib/session"
import { getSupabaseAdminClient } from "@/lib/db"
import { Header } from "@/components/waiter/header"
import { Footer } from "@/components/waiter/footer"
import { TablesGrid } from "@/components/waiter/tables-grid"

export default async function WaiterTablesPage() {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  const supabase = getSupabaseAdminClient()

  const [{ data: tables }, { data: allOrders }] = await Promise.all([
    supabase.from("RES_TABLE").select("id, table_num").eq("show", "service").order("table_num"),
    supabase
      .from("PARAGELIA")
      .select("table, user, status")
      .not("status", "in", "(completed)")
      .is("parent_order", null),
  ])

  const otherUserIds = [
    ...new Set(
      (allOrders ?? [])
        .filter((o) => o.user !== session.userId)
        .map((o) => o.user as number)
    ),
  ]

  const userNameMap = new Map<number, string>()
  if (otherUserIds.length > 0) {
    const { data: users } = await supabase
      .from("USER")
      .select("id, name")
      .in("id", otherUserIds)
    ;(users ?? []).forEach((u) => userNameMap.set(u.id as number, u.name as string))
  }

  const tablesWithStatus = (tables ?? []).map((table) => {
    const orders = (allOrders ?? []).filter((o) => o.table === table.id)

    if (orders.length === 0) return { ...table, status: "available" as const, waiterName: undefined }

    const otherOrder = orders.find((o) => o.user !== session.userId && (o.status === "active" || o.status === "paid"))
    if (otherOrder) {
      return {
        ...table,
        status: "other" as const,
        waiterName: userNameMap.get(otherOrder.user as number),
      }
    }

    const myActive = orders.some((o) => o.user === session.userId && o.status === "active")
    if (myActive) return { ...table, status: "mine" as const, waiterName: undefined }

    const myPaid = orders.some((o) => o.user === session.userId && o.status === "paid")
    if (myPaid) return { ...table, status: "mine-paid" as const, waiterName: undefined }

    return { ...table, status: "available" as const, waiterName: undefined }
  })

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F5]">
      <Header title={session.name} showLogout />
      <main className="flex-1">
        <TablesGrid tables={tablesWithStatus} />
      </main>
      <Footer />
    </div>
  )
}
