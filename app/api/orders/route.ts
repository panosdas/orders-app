import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "@/lib/session"
import { getSupabaseAdminClient } from "@/lib/db"

interface OrderItem {
  productId: number
  quantity: number
  price: number
  comment: string | null
}

interface CreateOrderBody {
  tableId: number
  parentOrderId: number | null
  items: OrderItem[]
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 })
  }

  let body: CreateOrderBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Μη έγκυρο σώμα αιτήματος" }, { status: 400 })
  }

  const { tableId, parentOrderId, items } = body

  if (!tableId || !items?.length) {
    return NextResponse.json({ error: "Λείπουν υποχρεωτικά πεδία" }, { status: 400 })
  }

  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  const supabase = getSupabaseAdminClient()

  const { data: newOrder, error: orderError } = await supabase
    .from("PARAGELIA")
    .insert({
      table: tableId,
      user: session.userId,
      status: "active",
      total_price: totalPrice,
      parent_order: parentOrderId ?? null,
    })
    .select("id")
    .single()

  if (orderError || !newOrder) {
    console.error("[ORDER INSERT ERROR]", orderError)
    return NextResponse.json({ error: "Σφάλμα δημιουργίας παραγγελίας" }, { status: 500 })
  }

  const productRows = items.map((item) => ({
    paragelia: newOrder.id,
    product: item.productId,
    quantity: item.quantity,
    price: item.price,
    comment: item.comment || null,
  }))

  const { error: itemsError } = await supabase.from("PRODUCTS_ORDER").insert(productRows)

  if (itemsError) {
    console.error("[PRODUCTS_ORDER INSERT ERROR]", itemsError)
    await supabase.from("PARAGELIA").delete().eq("id", newOrder.id)
    return NextResponse.json({ error: "Σφάλμα αποθήκευσης προϊόντων" }, { status: 500 })
  }

  const { error: printError } = await supabase
    .from("print_jobs")
    .insert({ order_id: newOrder.id })

  if (printError) {
    console.error("[PRINT JOB INSERT ERROR]", printError)
    await Promise.all([
      supabase.from("PRODUCTS_ORDER").delete().eq("paragelia", newOrder.id),
      supabase.from("PARAGELIA").delete().eq("id", newOrder.id),
    ])
    return NextResponse.json({ error: "Σφάλμα δημιουργίας εντολής εκτύπωσης" }, { status: 500 })
  }

  return NextResponse.json({ orderId: newOrder.id })
}
