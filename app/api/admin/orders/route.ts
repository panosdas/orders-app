import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "@/lib/session"
import { getSupabaseAdminClient } from "@/lib/db"

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn || session.role !== "admin") {
    return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get("status")

  const supabase = getSupabaseAdminClient()

  let ordersQuery = supabase
    .from("PARAGELIA")
    .select("id, created_at, status, total_price, table, user, parent_order")
    .order("table", { ascending: true })
    .order("id", { ascending: true })

  if (statusFilter && statusFilter !== "all") {
    ordersQuery = ordersQuery.eq("status", statusFilter)
  }

  const { data: orders, error: ordersError } = await ordersQuery

  if (ordersError) {
    console.error("[ORDERS FETCH ERROR]", ordersError)
    return NextResponse.json({ error: "Σφάλμα ανάκτησης παραγγελιών" }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json([])
  }

  const tableIds = [...new Set(orders.map((o) => o.table).filter(Boolean))]
  const userIds = [...new Set(orders.map((o) => o.user).filter(Boolean))]
  const orderIds = orders.map((o) => o.id)

  const [tablesRes, usersRes, itemsRes] = await Promise.all([
    supabase.from("RES_TABLE").select("id, table_num").in("id", tableIds),
    supabase.from("USER").select("id, name").in("id", userIds),
    supabase
      .from("PRODUCTS_ORDER")
      .select("paragelia, quantity, price, comment, product")
      .in("paragelia", orderIds),
  ])

  const productIds = [
    ...new Set((itemsRes.data || []).map((i) => i.product).filter(Boolean)),
  ]
  const { data: products } = await supabase
    .from("PRODUCT")
    .select("id, name")
    .in("id", productIds)

  const tableMap = Object.fromEntries(
    (tablesRes.data || []).map((t) => [t.id, t.table_num])
  )
  const userMap = Object.fromEntries(
    (usersRes.data || []).map((u) => [u.id, u.name])
  )
  const productMap = Object.fromEntries(
    (products || []).map((p) => [p.id, p.name])
  )

  const itemsByOrder = (itemsRes.data || []).reduce(
    (acc, item) => {
      if (!acc[item.paragelia]) acc[item.paragelia] = []
      acc[item.paragelia].push(item)
      return acc
    },
    {} as Record<number, { paragelia: number; quantity: number; price: number; comment: string | null; product: number }[]>
  )

  const result = orders.map((order) => ({
    id: order.id,
    status: order.status,
    totalPrice: order.total_price,
    tableName: tableMap[order.table] ?? String(order.table),
    userName: userMap[order.user] ?? "Άγνωστος",
    parentOrder: order.parent_order ?? null,
    items: (itemsByOrder[order.id] || []).map((item) => ({
      productName: productMap[item.product] ?? "Άγνωστο",
      quantity: item.quantity,
      price: item.price,
      comment: item.comment ?? null,
    })),
  }))

  return NextResponse.json(result)
}
