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

  const { data: products, error: productsError } = await supabase
    .from("PRODUCT")
    .select("id, name, price, category, isavailable")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  if (productsError) {
    console.error("[PRODUCTS FETCH ERROR]", productsError)
    return NextResponse.json({ error: "Σφάλμα ανάκτησης προϊόντων" }, { status: 500 })
  }

  if (!products || products.length === 0) {
    return NextResponse.json([])
  }

  const categoryIds = [...new Set(products.map((p) => p.category).filter(Boolean))]
  const { data: categories } = await supabase
    .from("PRODUCTS_CATEGORY")
    .select("id, name")
    .in("id", categoryIds)

  const categoryMap = Object.fromEntries(
    (categories || []).map((c) => [c.id, c.name])
  )

  const result = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    categoryId: p.category,
    categoryName: categoryMap[p.category] ?? "Άγνωστη",
    isAvailable: p.isavailable,
  }))

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn || session.role !== "admin") {
    return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 })
  }

  let name: string
  let price: number
  let categoryId: number

  try {
    const body = await request.json()
    name = body.name?.trim()
    price = Number(body.price)
    categoryId = Number(body.categoryId)
  } catch {
    return NextResponse.json({ error: "Μη έγκυρο σώμα αιτήματος" }, { status: 400 })
  }

  if (!name || isNaN(price) || price < 0 || !categoryId) {
    return NextResponse.json({ error: "Συμπληρώστε όλα τα υποχρεωτικά πεδία" }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("PRODUCT")
    .insert({ name, price, category: categoryId, isavailable: true })
    .select("id, name, price, category")
    .single()

  if (error) {
    console.error("[PRODUCT INSERT ERROR]", error)
    return NextResponse.json({ error: "Σφάλμα προσθήκης προϊόντος" }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
