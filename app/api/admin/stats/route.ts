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

  const supabase = getSupabaseAdminClient()

  // Fetch completed/paid orders for revenue
  const { data: orders, error: ordersError } = await supabase
    .from("PARAGELIA")
    .select("id, total_price")
    .in("status", ["paid", "completed"])

  if (ordersError) {
    console.error("[STATS ORDERS ERROR]", ordersError)
    return NextResponse.json({ error: "Σφάλμα ανάκτησης δεδομένων" }, { status: 500 })
  }

  const orderIds = (orders ?? []).map((o) => o.id)
  const totalRevenue = (orders ?? []).reduce((sum, o) => sum + (o.total_price ?? 0), 0)

  if (orderIds.length === 0) {
    return NextResponse.json({ totalRevenue: 0, byCategory: [] })
  }

  // Fetch order items for those orders
  const { data: items, error: itemsError } = await supabase
    .from("PRODUCTS_ORDER")
    .select("paragelia, product, quantity, price")
    .in("paragelia", orderIds)

  if (itemsError) {
    console.error("[STATS ITEMS ERROR]", itemsError)
    return NextResponse.json({ error: "Σφάλμα ανάκτησης δεδομένων" }, { status: 500 })
  }

  const productIds = [...new Set((items ?? []).map((i) => i.product).filter(Boolean))]

  const [productsRes, categoriesRes] = await Promise.all([
    supabase.from("PRODUCT").select("id, name, category").in("id", productIds),
    supabase.from("PRODUCTS_CATEGORY").select("id, name"),
  ])

  const productMap = Object.fromEntries(
    (productsRes.data ?? []).map((p) => [p.id, { name: p.name, category: p.category }])
  )
  const categoryMap = Object.fromEntries(
    (categoriesRes.data ?? []).map((c) => [c.id, c.name])
  )

  // Aggregate per product
  const productStats: Record<
    number,
    { productId: number; productName: string; categoryId: number; categoryName: string; totalQuantity: number; totalRevenue: number }
  > = {}

  for (const item of items ?? []) {
    const product = productMap[item.product]
    if (!product) continue
    if (!productStats[item.product]) {
      productStats[item.product] = {
        productId: item.product,
        productName: product.name,
        categoryId: product.category,
        categoryName: categoryMap[product.category] ?? "Άγνωστη",
        totalQuantity: 0,
        totalRevenue: 0,
      }
    }
    productStats[item.product].totalQuantity += item.quantity
    productStats[item.product].totalRevenue += item.quantity * item.price
  }

  // Group by category
  const byCategoryMap: Record<
    number,
    { categoryId: number; categoryName: string; products: typeof productStats[number][] }
  > = {}

  for (const stat of Object.values(productStats)) {
    if (!byCategoryMap[stat.categoryId]) {
      byCategoryMap[stat.categoryId] = {
        categoryId: stat.categoryId,
        categoryName: stat.categoryName,
        products: [],
      }
    }
    byCategoryMap[stat.categoryId].products.push(stat)
  }

  // Sort products within each category by revenue desc
  const byCategory = Object.values(byCategoryMap)
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName, "el"))
    .map((cat) => ({
      ...cat,
      products: cat.products.sort((a, b) => b.totalRevenue - a.totalRevenue),
    }))

  return NextResponse.json({ totalRevenue, byCategory })
}
