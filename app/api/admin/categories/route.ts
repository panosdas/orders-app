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
  const { data, error } = await supabase
    .from("PRODUCTS_CATEGORY")
    .select("id, name")
    .order("name", { ascending: true })

  if (error) {
    console.error("[CATEGORIES FETCH ERROR]", error)
    return NextResponse.json({ error: "Σφάλμα ανάκτησης κατηγοριών" }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn || session.role !== "admin") {
    return NextResponse.json({ error: "Μη εξουσιοδοτημένος" }, { status: 401 })
  }

  let name: string
  try {
    const body = await request.json()
    name = body.name?.trim()
  } catch {
    return NextResponse.json({ error: "Μη έγκυρο σώμα αιτήματος" }, { status: 400 })
  }

  if (!name) {
    return NextResponse.json({ error: "Το όνομα είναι υποχρεωτικό" }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("PRODUCTS_CATEGORY")
    .insert({ name })
    .select("id, name")
    .single()

  if (error) {
    console.error("[CATEGORY INSERT ERROR]", error)
    return NextResponse.json({ error: "Σφάλμα προσθήκης κατηγορίας" }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
