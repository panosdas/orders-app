import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "@/lib/session"
import { getSupabaseAdminClient } from "@/lib/db"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn || session.role !== "admin") {
    return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 })
  }

  let orderId: number
  try {
    const body = await request.json()
    orderId = body.orderId
  } catch {
    return NextResponse.json({ error: "Μη έγκυρο σώμα αιτήματος" }, { status: 400 })
  }

  if (!orderId) {
    return NextResponse.json({ error: "Απαιτείται αναγνωριστικό παραγγελίας" }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()
  const { error } = await supabase.from("print_jobs").insert({ order_id: orderId })

  if (error) {
    console.error("[PRINT JOB INSERT ERROR]", error)
    return NextResponse.json({ error: "Σφάλμα δημιουργίας εντολής εκτύπωσης" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
