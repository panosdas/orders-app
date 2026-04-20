import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "@/lib/session"
import { getSupabaseAdminClient } from "@/lib/db"

export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn || session.role !== "admin") {
    return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 })
  }

  const { orderId } = await request.json()

  if (!orderId) {
    return NextResponse.json({ error: "Λείπει το orderId" }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()

  const [{ error: mainError }, { error: subError }] = await Promise.all([
    supabase.from("PARAGELIA").update({ status: "completed" }).eq("id", orderId),
    supabase.from("PARAGELIA").update({ status: "completed" }).eq("parent_order", orderId),
  ])

  if (mainError || subError) {
    console.error("[COMPLETE ERROR]", mainError ?? subError)
    return NextResponse.json({ error: "Σφάλμα ενημέρωσης κατάστασης" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
