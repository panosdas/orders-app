import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "@/lib/session"
import { getSupabaseAdminClient } from "@/lib/db"

const TAKEAWAY_TABLE_ID = 7

interface TakeawayItem {
  productId: number
  quantity: number
  price: number
  comment: string | null
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn || session.role !== "admin") {
    return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 })
  }

  let items: TakeawayItem[]
  try {
    const body = await request.json()
    items = body.items
  } catch {
    return NextResponse.json({ error: "Μη έγκυρο σώμα αιτήματος" }, { status: 400 })
  }

  if (!items?.length) {
    return NextResponse.json({ error: "Δεν υπάρχουν προϊόντα" }, { status: 400 })
  }

  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const supabase = getSupabaseAdminClient()

  const { data: newOrder, error: orderError } = await supabase
    .from("PARAGELIA")
    .insert({
      table: TAKEAWAY_TABLE_ID,
      user: session.userId,
      status: "completed",
      total_price: totalPrice,
      parent_order: null,
    })
    .select("id")
    .single()

  if (orderError || !newOrder) {
    console.error("[TAKEAWAY ORDER INSERT ERROR]", orderError)
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
    console.error("[TAKEAWAY PRODUCTS_ORDER INSERT ERROR]", itemsError)
    await supabase.from("PARAGELIA").delete().eq("id", newOrder.id)
    return NextResponse.json({ error: "Σφάλμα αποθήκευσης προϊόντων" }, { status: 500 })
  }

  const { error: printError } = await supabase
    .from("print_jobs")
    .insert({ order_id: newOrder.id })

  if (printError) {
    console.error("[TAKEAWAY PRINT JOB INSERT ERROR]", printError)
    await Promise.all([
      supabase.from("PRODUCTS_ORDER").delete().eq("paragelia", newOrder.id),
      supabase.from("PARAGELIA").delete().eq("id", newOrder.id),
    ])
    return NextResponse.json({ error: "Σφάλμα δημιουργίας εντολής εκτύπωσης" }, { status: 500 })
  }

  return NextResponse.json({ orderId: newOrder.id })
}
